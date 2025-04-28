// Components/YouTubeDashboard.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Header from "../components/Header/Header";
import { VideoList } from "../components/VideoList";
import { COLORS } from "./constants";
import { isShort, getDurationInSeconds, getDayOfWeek, formatNumber } from "./utils";

export default function YouTubeDashboard() {
  const channelId = "UCk-rlf99uFhzNSu5VrhNsmA";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchYouTubeData() {
      try {
        setLoading(true);
        setError(null);
        setErrorDetails(null);

        // Fetch channel statistics
        const channelResponse = await fetch(`/api/youtube?action=channel-stats&channelId=${channelId}`);

        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          throw new Error(`Failed to fetch channel data: ${errorData.error || channelResponse.statusText}`);
        }

        const channelJson = await channelResponse.json();

        if (!channelJson.items || channelJson.items.length === 0) {
          throw new Error("No channel found with the provided ID");
        }

        setChannelData(channelJson.items[0]);

        // Fetch latest videos
        const recentVideosResponse = await fetch(`/api/youtube?action=latest-videos&channelId=${channelId}`);

        if (!recentVideosResponse.ok) {
          const errorData = await recentVideosResponse.json();
          throw new Error(`Failed to fetch recent videos: ${errorData.error || recentVideosResponse.statusText}`);
        }

        const recentVideosJson = await recentVideosResponse.json();
        setRecentVideos(recentVideosJson.items || []);

        // Fetch popular videos
        const popularVideosResponse = await fetch(`/api/youtube?action=popular-videos&channelId=${channelId}`);

        if (!popularVideosResponse.ok) {
          const errorData = await popularVideosResponse.json();
          throw new Error(`Failed to fetch popular videos: ${errorData.error || popularVideosResponse.statusText}`);
        }

        const popularVideosJson = await popularVideosResponse.json();
        setPopularVideos(popularVideosJson.items || []);

        // Fetch analytics data
        const analyticsResponse = await fetch(`/api/youtube?action=analytics&channelId=${channelId}`);

        if (!analyticsResponse.ok) {
          const errorData = await analyticsResponse.json();
          console.warn(`Could not fetch analytics: ${errorData.error || analyticsResponse.statusText}`);
          // Don't throw error here, we can still show the dashboard without analytics
        } else {
          const analyticsJson = await analyticsResponse.json();
          setAnalyticsData(analyticsJson);
        }
      } catch (err) {
        console.error("Error fetching YouTube data:", err);
        setError(err.message || "Failed to fetch YouTube data");

        // Capture additional error details for debugging
        setErrorDetails({
          message: err.message,
          stack: err.stack,
          channelId: channelId,
        });
      } finally {
        setLoading(false);
      }
    }

    if (channelId && channelId !== "YOUR_CHANNEL_ID") {
      fetchYouTubeData();
    } else {
      setError("Please set your YouTube channel ID in the component");
      setLoading(false);
    }
  }, [channelId]);

  // Calculate channel analytics
  const calculateAnalytics = () => {
    if (!recentVideos || recentVideos.length === 0) return {};

    // Total views from recent videos
    const totalViews = recentVideos.reduce((acc, video) => {
      return acc + parseInt(video.statistics?.statistics?.viewCount || 0);
    }, 0);

    // Average views per video
    const avgViews = Math.round(totalViews / recentVideos.length);

    // Average engagement (likes/views ratio)
    const totalLikes = recentVideos.reduce((acc, video) => {
      return acc + parseInt(video.statistics?.statistics?.likeCount || 0);
    }, 0);

    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : 0;

    // Average video duration
    const totalDuration = recentVideos.reduce((acc, video) => {
      return acc + getDurationInSeconds(video.statistics?.contentDetails?.duration || "PT0S");
    }, 0);

    const avgDuration = Math.round(totalDuration / recentVideos.length);
    const avgDurationFormatted = `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, "0")}`;

    // Upload day frequency
    const uploadDays = recentVideos.reduce((acc, video) => {
      const day = getDayOfWeek(video.snippet?.publishedAt);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // const uploadDaysChart = Object.keys(uploadDays).map(day => ({
    //   name: day,
    //   uploads: uploadDays[day]
    // }));

    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

    const uploadDaysChart = daysOfWeek.map((day) => ({
      name: day,
      uploads: uploadDays[`${day}요일`] || 0,
    }));

    // View distribution
    const viewDistribution = recentVideos.map((video) => ({
      name: video.snippet?.title?.substring(0, 30) + "...",
      views: parseInt(video.statistics?.statistics?.viewCount || 0),
    }));

    return {
      avgViews,
      engagementRate,
      avgDuration,
      avgDurationFormatted,
      uploadDaysChart,
      viewDistribution,
    };
  };

  const analytics = calculateAnalytics();

  return (
    <main className={styles.main}>
      <Header />

      <div className={styles.dashboard}>
        {loading && <div className={styles.loading}>데이터를 불러오는 중...</div>}

        {error && (
          <div className={styles.error}>
            <p>
              <strong>에러:</strong> {error}
            </p>
            {errorDetails && (
              <details>
                <summary>디버깅 정보</summary>
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </details>
            )}
            
          </div>
        )}

        {channelData && !loading && (
          <>
            <div className={styles.channelCard}>
              <div className={styles.channelHeader}>
                {channelData.snippet?.thumbnails?.medium?.url && (
                  <Image src={channelData.snippet.thumbnails.medium.url} alt={channelData.snippet?.title || "Channel Thumbnail"} width={120} height={120} className={styles.channelThumbnail} />
                )}
                <div className={styles.channelInfo}>
                  <h1>{channelData.snippet?.title || "Channel Name"}</h1>
                  <p className={styles.channelDescription}>
                    {channelData.snippet?.description
                      ? channelData.snippet.description.length > 200
                        ? channelData.snippet.description.substring(0, 200) + "..."
                        : channelData.snippet.description
                      : "No description available"}
                  </p>
                  <div className={styles.channelUrl}>
                    <Link href={`https://www.youtube.com/channel/${channelId}`} target="_blank" rel="noopener noreferrer">
                      youtube.com/channel/{channelId}
                    </Link>
                  </div>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <h3>구독자</h3>
                  <p className={styles.statValue}>{formatNumber(channelData.statistics?.subscriberCount)}</p>
                </div>
                <div className={styles.statBox}>
                  <h3>총 조회수</h3>
                  <p className={styles.statValue}>{formatNumber(channelData.statistics?.viewCount)}</p>
                </div>
                <div className={styles.statBox}>
                  <h3>총 동영상</h3>
                  <p className={styles.statValue}>{formatNumber(channelData.statistics?.videoCount)}</p>
                </div>
                <div className={styles.statBox}>
                  <h3>평균 조회수</h3>
                  <p className={styles.statValue}>{formatNumber(analytics.avgViews)}</p>
                </div>
                <div className={styles.statBox}>
                  <h3>평균 길이</h3>
                  <p className={styles.statValue}>{analytics.avgDurationFormatted}</p>
                </div>
                <div className={styles.statBox}>
                  <h3>인게이지먼트</h3>
                  <p className={styles.statValue}>{analytics.engagementRate}%</p>
                </div>
              </div>
            </div>

            <div className={styles.tabs}>
              <button className={`${styles.tabButton} ${activeTab === "overview" ? styles.activeTab : ""}`} onClick={() => setActiveTab("overview")}>
                개요
              </button>
              <button className={`${styles.tabButton} ${activeTab === "analytics" ? styles.activeTab : ""}`} onClick={() => setActiveTab("analytics")}>
                분석
              </button>
              <button className={`${styles.tabButton} ${activeTab === "recent" ? styles.activeTab : ""}`} onClick={() => setActiveTab("recent")}>
                최근 업로드
              </button>
              <button className={`${styles.tabButton} ${activeTab === "popular" ? styles.activeTab : ""}`} onClick={() => setActiveTab("popular")}>
                인기 동영상
              </button>
            </div>

            {activeTab === "overview" && (
              <div className={styles.overviewTab}>
                <div className={styles.analyticsGridContainer}>
                  {/* <div className={styles.analyticsCard}>
                  <h3>최근 인기 동영상</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.viewDistribution?.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={false} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#8884d8" name="조회수" />
                    </BarChart>
                  </ResponsiveContainer>
                </div> */}

                  <div className={styles.analyticsCard}>
                    <h3>요일별 업로드 빈도</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.uploadDaysChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="uploads" fill="#82ca9d" name="업로드 수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={styles.recentVideosPreview}>
                  <h3 className={styles.previewTitle}>최근 동영상</h3>
                  <div className={styles.videoList}>
                    {recentVideos.slice(0, 3).map((video, index) => (
                      <Link href={`https://www.youtube.com/watch?v=${video.contentDetails?.videoId}`} target="_blank" rel="noopener noreferrer" key={index} className={styles.videoListItemCompact}>
                        <div className={styles.thumbnailContainerSmall}>
                          {video.snippet?.thumbnails?.medium?.url && (
                            <Image src={video.snippet.thumbnails.medium.url} alt={video.snippet?.title || "Video Thumbnail"} width={180} height={100} className={styles.videoThumbnail} />
                          )}
                        </div>
                        <div className={styles.videoInfoCompact}>
                          <h3 className={styles.videoTitleCompact}>{video.snippet?.title || "Untitled Video"}</h3>
                          <span className={styles.statItemCompact}>👁️ {formatNumber(video.statistics?.statistics?.viewCount)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className={styles.popularVideosPreview}>
                  <h3 className={styles.previewTitle}>인기 동영상</h3>
                  <div className={styles.videoList}>
                    {popularVideos.slice(0, 3).map((video, index) => (
                      <Link href={`https://www.youtube.com/watch?v=${video.contentDetails?.videoId}`} target="_blank" rel="noopener noreferrer" key={index} className={styles.videoListItemCompact}>
                        <div className={styles.thumbnailContainerSmall}>
                          {video.snippet?.thumbnails?.medium?.url && (
                            <Image src={video.snippet.thumbnails.medium.url} alt={video.snippet?.title || "Video Thumbnail"} width={180} height={100} className={styles.videoThumbnail} />
                          )}
                        </div>
                        <div className={styles.videoInfoCompact}>
                          <h3 className={styles.videoTitleCompact}>{video.snippet?.title || "Untitled Video"}</h3>
                          <span className={styles.statItemCompact}>👁️ {formatNumber(video.statistics?.statistics?.viewCount)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className={styles.analyticsTab}>
                <div className={styles.analyticsGridContainer}>
                  <div className={styles.analyticsCard}>
                    <h3>조회수 분포</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.viewDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={false} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#8884d8" name="조회수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* <div className={styles.analyticsCard}>
                  <h3>요일별 업로드 빈도</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.uploadDaysChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="uploads" fill="#82ca9d" name="업로드 수" />
                    </BarChart>
                  </ResponsiveContainer>
                </div> */}

                  <div className={styles.analyticsCard}>
                    <h3>비디오 타입 분포</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "일반 동영상", value: recentVideos.filter((v) => !isShort(v)).length },
                            { name: "Shorts", value: recentVideos.filter((v) => isShort(v)).length },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[0, 1].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* {analyticsData && analyticsData.monthlyViews && (
                  <div className={styles.analyticsCard}>
                    <h3>월별 채널 조회수</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.monthlyViews}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#8884d8" name="조회수" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )} */}
                </div>

                <div className={styles.analyticsSummary}>
                  <h3>채널 통계 요약</h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <h4>평균 조회수</h4>
                      <p>{formatNumber(analytics.avgViews)}</p>
                    </div>
                    <div className={styles.summaryItem}>
                      <h4>평균 영상 길이</h4>
                      <p>{analytics.avgDurationFormatted}</p>
                    </div>
                    <div className={styles.summaryItem}>
                      <h4>인게이지먼트 비율</h4>
                      <p>{analytics.engagementRate}%</p>
                    </div>
                    <div className={styles.summaryItem}>
                      <h4>구독자당 조회수</h4>
                      <p>{channelData.statistics?.subscriberCount > 0 ? (parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.subscriberCount)).toFixed(1) : 0}</p>
                    </div>
                    {/* <div className={styles.summaryItem}>
                    <h4>가장 인기 있는 요일</h4>
                    <p>{analytics.uploadDaysChart && analytics.uploadDaysChart.length > 0 
                        ? analytics.uploadDaysChart.sort((a, b) => b.uploads - a.uploads)[0].name 
                        : "데이터 부족"}
                    </p>
                  </div> */}
                    <div className={styles.summaryItem}>
                      <h4>월평균 업로드</h4>
                      <p>{recentVideos.length > 0 ? Math.round(recentVideos.length / 3) : 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "recent" && <VideoList videos={recentVideos} title="최근 업로드" />}

            {activeTab === "popular" && <VideoList videos={popularVideos} title="인기 동영상" />}
            <br />
            <br />
            <br />
          </>
        )}
      </div>
    </main>
  );
}
