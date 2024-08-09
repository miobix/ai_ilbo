import styles from "./page.module.css";
import Link from "next/link";
import { parseDateTime } from "../../utils/common.js";

export default function HomepageNewsCard({ news }) {

  function parseDescription(articleBody) {
    // Replace all single quotes with double quotes
    const formattedString = articleBody.replace(/'/g, '"');

    // Split the article body into sections based on the "##" separator
    const sections = formattedString.split("##");

    // Remove the section titles and truncate the descriptions to 50 characters
    const sanitizedDescription = sections
      .map((section) => section.trim()) // Remove leading/trailing whitespace
      .filter((section) => section !== "") // Remove empty sections
      .map((section) =>
        section.length > 50 ? section.substring(0, 50) + "..." : section
      ) // Truncate descriptions
      .join(" "); // Join the sections back into a single string

    return sanitizedDescription;
  }
  function isTimestampBefore(dateStr) {
    const comparisonDateStr = "2024-08-08 09:39:00";
    if (!dateStr) {
      console.log("Timestamp does not exist.");
      return;
    }
  
    // Parse the date strings into Date objects
    const date = new Date(dateStr.replace(" ", "T"));
    const comparisonDate = new Date(comparisonDateStr.replace(" ", "T"));
  
    // Compare the dates
    const isBefore = date < comparisonDate;
    return isBefore
  }
  if (!news) {
    // If news data is not available yet, return a loading indicator or null
    return <div>Loading...</div>;
  }

  let imageSrc;

  if (news?.category == "경제") {
    if (news?.img_src){
      imageSrc = `/${news.img_src}.jpg`;
    }
  } else if (news?.category === "SNS") {
    if (news.post_images && news.post_images.length > 0) {
      imageSrc = `${news.post_images[0]}`;
    } else {
      imageSrc = `/sns_profile_pictures/${news.sns_profile}.png`;
    }
  } else if (news?.zone === "Daegu") {
    imageSrc = news.img_src
  } else {
    imageSrc = "/image_press_1.jpg";
  }


  return (
    <Link href={`/article/${news._id}`}>
      <p className={styles.img}>
        <img
        
          src={
            news.generated_img_url ? news.generated_img_url?.original : news.original ? news.original : imageSrc
          }
          alt="News Image"
        />
      </p>
      <div className={styles.cnt}>
        <p className={styles.tit}>{news && news.category ? (news.category == "SNS" ? `` : "") : ""}{news?.summary?.title}</p>
        <p className={styles.cont}>
        {news.timestamp && isTimestampBefore(news.timestamp) ? parseDescription(news.summary.article_body) : news.summary.article_body}
        </p>
        <p className={styles.date}>
          {parseDateTime(news.read_date ? news.read_date : news.timestamp)}
        </p>
      </div>
    </Link>
  );
}
