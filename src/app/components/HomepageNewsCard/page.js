import styles from "./page.module.css";
import Link from "next/link";
import { parseDateTime } from "../../utils/common.js";

export default function HomepageNewsCard({ news }) {
  
  function parseDescription(articleBody) {
    // Split the article body into sections based on the "##" separator
    const sections = articleBody.split("##");

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

  if (!news) {
    // If news data is not available yet, return a loading indicator or null
    return <div>Loading...</div>;
  }

  const imageSrc = news?.img_src ? `/${news.img_src}.jpg` : "/image_press_1.jpg";

  return (
    <Link href={`/article/${news._id}`}>
      <p className={styles.img}>
        <img
          src={
            news.generated_img_url ? news.generated_img_url?.original : imageSrc
          }
          alt="News Image"
        />
      </p>
      <div className={styles.cnt}>
        <p className={styles.tit}>{news && news.category ? (news.category == "SNS" ? `[${news.sns_profile}] ` : "") : ""}{news?.summary?.title}</p>
        <p className={styles.cont}>
          {parseDescription(news.summary?.article_body)}
        </p>
        <p className={styles.date}>
          {parseDateTime(news.read_date ? news.read_date : news.timestamp)}
        </p>
      </div>
    </Link>
  );
}
