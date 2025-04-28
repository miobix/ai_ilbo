// pages/api/youtube.js
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    console.log("API request received");
    const { action, channelId } = req.query;
    
    console.log(`Action: ${action}, Channel ID: ${channelId}`);
    
    if (!channelId) {
      console.error("Missing channelId parameter");
      return res.status(400).json({ error: 'Channel ID is required' });
    }
    
    if (!API_KEY) {
      console.error("API key not configured in environment variables");
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Channel statistics
    if (action === 'channel-stats') {
      const data = await fetchChannelData(channelId, API_KEY);
      console.log("Channel data fetched successfully");
      return res.status(200).json(data);
    } 
    
    // Latest videos
    else if (action === 'latest-videos') {
      // First get channel data to extract uploads playlist ID
      console.log("Fetching channel data to get uploads playlist ID");
      const channelData = await fetchChannelData(channelId, API_KEY);
      
      if (!channelData.items || channelData.items.length === 0) {
        console.error("No channel found with the provided ID");
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        console.error("Unable to find uploads playlist ID in channel data");
        return res.status(404).json({ error: 'Unable to find uploads playlist' });
      }
      
      console.log(`Uploads playlist ID: ${uploadsPlaylistId}`);
      
      // Get latest videos from that playlist (up to 25)
      const latestVideos = await fetchPlaylistItems(uploadsPlaylistId, API_KEY, 25);
      
      if (!latestVideos.items || latestVideos.items.length === 0) {
        console.log("No videos found in the uploads playlist");
        return res.status(200).json({ items: [] });
      }
      
      // Extract video IDs to fetch statistics
      const videoIds = latestVideos.items
        .filter(item => item.contentDetails && item.contentDetails.videoId)
        .map(item => item.contentDetails.videoId);
      
      console.log(`Found ${videoIds.length} video IDs for statistics lookup`);
      
      // Fetch video statistics if we have video IDs
      const videoStats = videoIds.length > 0 
        ? await fetchVideoStats(videoIds, API_KEY) 
        : { items: [] };
      
      // Combine video data with statistics
      const videosWithStats = latestVideos.items.map(video => {
        const stats = videoStats.items?.find(
          item => item.id === video.contentDetails?.videoId
        );
        
        return {
          ...video,
          statistics: stats || {}
        };
      });
      
      console.log(`Returning ${videosWithStats.length} videos with stats`);
      return res.status(200).json({
        items: videosWithStats
      });
    } 
    
    // Popular videos (most viewed)
    else if (action === 'popular-videos') {
      // Get channel uploads playlist
      console.log("Fetching channel data for popular videos");
      const channelData = await fetchChannelData(channelId, API_KEY);
      
      if (!channelData.items || channelData.items.length === 0) {
        console.error("No channel found with the provided ID");
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        console.error("Unable to find uploads playlist ID in channel data");
        return res.status(404).json({ error: 'Unable to find uploads playlist' });
      }
      
      // Get up to 50 videos from the playlist
      const allVideos = await fetchPlaylistItems(uploadsPlaylistId, API_KEY, 50);
      
      if (!allVideos.items || allVideos.items.length === 0) {
        console.log("No videos found in the uploads playlist");
        return res.status(200).json({ items: [] });
      }
      
      // Extract video IDs
      const videoIds = allVideos.items
        .filter(item => item.contentDetails && item.contentDetails.videoId)
        .map(item => item.contentDetails.videoId);
      
      // Fetch video statistics
      const videoStats = videoIds.length > 0 
        ? await fetchVideoStats(videoIds, API_KEY) 
        : { items: [] };
      
      // Combine video data with statistics
      const videosWithStats = allVideos.items.map(video => {
        const stats = videoStats.items?.find(
          item => item.id === video.contentDetails?.videoId
        );
        
        return {
          ...video,
          statistics: stats || {}
        };
      });
      
      // Sort by view count (highest first)
      const sortedVideos = videosWithStats.sort((a, b) => {
        const viewsA = parseInt(a.statistics?.statistics?.viewCount || 0);
        const viewsB = parseInt(b.statistics?.statistics?.viewCount || 0);
        return viewsB - viewsA;
      });
      
      // Return the top 10 most viewed videos
      console.log(`Returning top ${Math.min(10, sortedVideos.length)} popular videos`);
      return res.status(200).json({
        items: sortedVideos.slice(0, 10)
      });
    }
    
    // Analytics data
    else if (action === 'analytics') {
      console.log("Fetching analytics data");
      
      try {
        // First get channel info and latest videos
        const channelData = await fetchChannelData(channelId, API_KEY);
        
        if (!channelData.items || channelData.items.length === 0) {
          console.error("No channel found with the provided ID");
          return res.status(404).json({ error: 'Channel not found' });
        }
        
        const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
        
        if (!uploadsPlaylistId) {
          console.error("Unable to find uploads playlist ID in channel data");
          return res.status(404).json({ error: 'Unable to find uploads playlist' });
        }
        
        // Get up to 50 videos to analyze
        const allVideos = await fetchPlaylistItems(uploadsPlaylistId, API_KEY, 50);
        
        if (!allVideos.items || allVideos.items.length === 0) {
          console.log("No videos found for analytics");
          return res.status(200).json({
            monthlyViews: [],
            uploadTimes: [],
            categoryDistribution: []
          });
        }
        
        // Extract video IDs
        const videoIds = allVideos.items
          .filter(item => item.contentDetails && item.contentDetails.videoId)
          .map(item => item.contentDetails.videoId);
        
        // Get full video details including statistics and content details
        const videoStats = videoIds.length > 0 
          ? await fetchVideoStats(videoIds, API_KEY) 
          : { items: [] };
        
        // Combine all data
        const videosWithStats = allVideos.items.map(video => {
          const stats = videoStats.items?.find(
            item => item.id === video.contentDetails?.videoId
          );
          
          return {
            ...video,
            statistics: stats || {}
          };
        });
        
        // Calculate monthly views
        const monthlyViews = calculateMonthlyViews(videosWithStats);
        
        // Calculate upload times
        const uploadTimes = calculateUploadTimes(videosWithStats);
        
        return res.status(200).json({
          monthlyViews,
          uploadTimes
        });
        
      } catch (error) {
        console.error("Error generating analytics:", error);
        return res.status(500).json({ error: 'Failed to generate analytics data' });
      }
    }
    
    else {
      console.error(`Invalid action: ${action}`);
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch YouTube data' });
  }
}

// Function to fetch channel data by channel ID
async function fetchChannelData(channelId, apiKey) {
  console.log(`Fetching channel data for: ${channelId}`);
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`Channel API error: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error(`Error response: ${errorText}`);
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Function to fetch playlist items with pagination support
async function fetchPlaylistItems(playlistId, apiKey, maxResults = 10, pageToken = null) {
  console.log(`Fetching videos from playlist: ${playlistId}`);
  let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
  
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`Playlist API error: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error(`Error response: ${errorText}`);
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Function to fetch video statistics for multiple videos
async function fetchVideoStats(videoIds, apiKey) {
  if (!videoIds || videoIds.length === 0) {
    return { items: [] };
  }
  
  // Handle the case where there are many video IDs (YouTube API has a limit)
  if (videoIds.length > 50) {
    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      chunks.push(videoIds.slice(i, i + 50));
    }
    
    let allResults = { items: [] };
    for (const chunk of chunks) {
      const chunkResults = await fetchVideoStatsChunk(chunk, apiKey);
      if (chunkResults && chunkResults.items) {
        allResults.items = [...allResults.items, ...chunkResults.items];
      }
    }
    
    return allResults;
  } else {
    return await fetchVideoStatsChunk(videoIds, apiKey);
  }
}

async function fetchVideoStatsChunk(videoIds, apiKey) {
  const ids = videoIds.join(',');
  console.log(`Fetching stats for videos: ${ids.substring(0, 50)}...`);
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`Video stats API error: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error(`Error response: ${errorText}`);
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Calculate monthly view distribution from video data
function calculateMonthlyViews(videos) {
  const months = {};
  
  videos.forEach(video => {
    if (!video.snippet?.publishedAt || !video.statistics?.statistics?.viewCount) return;
    
    const date = new Date(video.snippet.publishedAt);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
    const views = parseInt(video.statistics.statistics.viewCount);
    
    if (!months[monthYear]) {
      months[monthYear] = {
        month: monthName,
        views: 0,
        videos: 0
      };
    }
    
    months[monthYear].views += views;
    months[monthYear].videos += 1;
  });
  
  // Convert to array and sort by date
  return Object.values(months).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA - dateB;
  });
}

// Calculate upload time distribution
function calculateUploadTimes(videos) {
  const timeSlots = {};
  
  videos.forEach(video => {
    if (!video.snippet?.publishedAt) return;
    
    const date = new Date(video.snippet.publishedAt);
    const hour = date.getHours();
    const timeSlot = Math.floor(hour / 4) * 4; // Group by 4-hour slots
    const slotLabel = `${String(timeSlot).padStart(2, '0')}:00 - ${String(timeSlot + 4).padStart(2, '0')}:00`;
    
    if (!timeSlots[slotLabel]) {
      timeSlots[slotLabel] = {
        timeSlot: slotLabel,
        count: 0
      };
    }
    
    timeSlots[slotLabel].count += 1;
  });
  
  // Convert to array and sort by time slot
  return Object.values(timeSlots).sort((a, b) => {
    const hourA = parseInt(a.timeSlot.split(':')[0]);
    const hourB = parseInt(b.timeSlot.split(':')[0]);
    return hourA - hourB;
  });
}