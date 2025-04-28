// Helper function to format date
const formatDate = (isoDate) => {
  if (!isoDate) return "";

  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return isoDate;
  }
};

// Helper function to format duration from ISO 8601 format
const formatDuration = (duration) => {
  if (!duration) return "--:--";
  // Remove PT from the start
  let time = duration.substring(2);
  let hours = 0,
    minutes = 0,
    seconds = 0;

  // Extract hours if present
  if (time.includes("H")) {
    hours = parseInt(time.split("H")[0]);
    time = time.split("H")[1];
  }

  // Extract minutes if present
  if (time.includes("M")) {
    minutes = parseInt(time.split("M")[0]);
    time = time.split("M")[1];
  }

  // Extract seconds if present
  if (time.includes("S")) {
    seconds = parseInt(time.split("S")[0]);
  }

  // Format the time
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

// Get day of week from date
const getDayOfWeek = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return days[date.getDay()];
};

// Helper function to format large numbers
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";

  num = parseInt(num);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Get duration in seconds (for calculations)
const getDurationInSeconds = (duration) => {
  if (!duration) return 0;

  let time = duration.substring(2);
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (time.includes("H")) {
    hours = parseInt(time.split("H")[0]);
    time = time.split("H")[1];
  }

  if (time.includes("M")) {
    minutes = parseInt(time.split("M")[0]);
    time = time.split("M")[1];
  }

  if (time.includes("S")) {
    seconds = parseInt(time.split("S")[0]);
  }

  return hours * 3600 + minutes * 60 + seconds;
};


  // Determine if a video is a Short
  const isShort = (video) => {
    if (!video || !video.statistics) return false;
    
    const contentDetails = video.statistics.contentDetails;
    if (!contentDetails) return false;
    
    // Check if duration is less than 60 seconds
    if (contentDetails.duration) {
      const duration = contentDetails.duration;
      if (!duration.includes('H') && !duration.includes('M')) {
        // Only has seconds
        const seconds = parseInt(duration.replace(/\D/g, ''));
        return seconds < 60;
      }
    }
    
    return false;
  };


  export { formatDate, formatDuration, getDayOfWeek, formatNumber, getDurationInSeconds, isShort }