export function parseDateTime(dateString) {

  // Check if the string matches the original format "yyyyMMddHHmm"
  if (/^\d{14}$/.test(dateString)) {

    try {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hours = dateString.substring(8, 10);
      const minutes = dateString.substring(10, 12);

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing original format:", error);
      return "Invalid Date";
    }
  } else {
    
    // Assume the string matches the new format "yyyy-MM-dd HH:mm:ss"
    try {
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing new format:", error);
      return "Invalid Date";
    }
  }
}

export function parseArticleBody(articleBodyString) {
  const sections = articleBodyString.split("##");
  const parsedSections = sections
    .filter((section) => section.trim() !== "")
    .map((section) => section.trim());
  return parsedSections;
}


export function generateShortArticleDescription(articleBody){
  const sections = articleBody.split("##");
  const sanitizedDescription = sections
    .map((section) => section.trim())
    .filter((section) => section !== "") 
    .join(" ");
  return sanitizedDescription.substring(0, 120) + "...";
}


export function hangulizeGeographicZone(zone){
  const zoneMapping = {
    "대구": "",
    "경북": "",
  };
  return zoneMapping[zone] || "";
}

export function isPressRelease(news) {
  return news && news.zone !== undefined;
}

export function formatTodayDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  // Array of Korean day names
  const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = koreanDays[currentDate.getDay()];

  return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
}


export function getInternalImageSource(newsData) {
  // for nextjs website handling
  let imageSrc;
  if (newsData?.zone == "Gov" || newsData?.generated_img_url || newsData?.original) {
    imageSrc = "/press_release_defaults/now_2.jpg";
  } 
  else {
    if (newsData?.category === "경제") {
      if (newsData?.img_src) {
        imageSrc = `/${newsData.img_src}.jpg`;
      }
    } 
    else if (newsData?.category === "SNS") {
      if (newsData.post_images && newsData.post_images.length > 0) {
        imageSrc = `${newsData.post_images[0]}`;
      } else {
        imageSrc = `/sns_profile_pictures/${newsData.sns_profile}.png`;
      }
    } 
    else if (newsData?.zone === '대구' || newsData?.zone === '경북') {
      imageSrc = newsData?.img_src ? newsData.img_src : "/press_release_defaults/now_2.jpg";
    } 
    else {
      imageSrc = "/press_release_defaults/now_2.jpg";
    }
  }

  return imageSrc;
}


export function getExternalImageSource(newsItem){
  // for the rss feed
  if (newsItem?.category == "경제") {
    if (newsItem?.img_src){
      return `/${newsItem.img_src}.jpg`;
    }
  } else if (newsItem?.category === "SNS") {
    if (newsItem.post_images && newsItem.post_images.length > 0) {
      return `${newsItem.post_images[0]}`;
    } else {
      return `https://yeongnam.ai/sns_profile_pictures/${newsItem.sns_profile}.png`;
    }
  } else if (newsItem?.zone) {
    if(newsItem.zone == '의원실' && newsItem.img_src){
      return newsItem.img_src
    }
    else{
      return "https://yeongnam.ai/press_release_defaults/now_2.jpg";
    }
  } else {
    return "https://yeongnam.ai/press_release_defaults/now_2.jpg";
  }
}

