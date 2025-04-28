  // Video list component
import styles from '../youtube/page.module.css'
import Link from 'next/link';
import Image from 'next/image';
import { isShort, formatNumber, formatDuration, formatDate  } from "../youtube/utils";


  const VideoList = ({ videos, title }) => (
    <div className={styles.videoListSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      
      {videos.length > 0 ? (
        <div className={styles.videoList}>
          {videos.map((video, index) => (
            <Link 
              href={`https://www.youtube.com/watch?v=${video.contentDetails?.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className={styles.videoListItem} 
            >
              <div className={styles.thumbnailContainer}>
                {video.snippet?.thumbnails?.medium?.url && (
                  <Image 
                    src={video.snippet.thumbnails.medium.url} 
                    alt={video.snippet?.title || 'Video Thumbnail'} 
                    width={240} 
                    height={135} 
                    className={styles.videoThumbnail}
                  />
                )}
                {isShort(video) && <span className={styles.shortBadge}>Shorts</span>}
                {video.statistics?.contentDetails?.duration && (
                  <span className={styles.videoDuration}>
                    {formatDuration(video.statistics.contentDetails.duration)}
                  </span>
                )}
              </div>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{video.snippet?.title || 'Untitled Video'}</h3>
                <p className={styles.videoDate}>
                  {formatDate(video.snippet?.publishedAt)}
                </p>
                <div className={styles.videoStats}>
                  <span className={styles.statItem}>
                    👁️ {formatNumber(video.statistics?.statistics?.viewCount)}
                  </span>
                  <span className={styles.statItem}>
                    👍 {formatNumber(video.statistics?.statistics?.likeCount)}
                  </span>
                  <span className={styles.statItem}>
                    💬 {formatNumber(video.statistics?.statistics?.commentCount)}
                  </span>
                </div>
                <p className={styles.videoDescription}>
                  {video.snippet?.description
                    ? (video.snippet.description.length > 100 
                        ? video.snippet.description.substring(0, 100) + '...' 
                        : video.snippet.description)
                    : 'No description available'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>동영상을 찾을 수 없습니다.</p>
      )}
    </div>
  );

  export { VideoList }