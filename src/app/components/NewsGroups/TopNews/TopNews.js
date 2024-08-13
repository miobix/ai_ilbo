import Image from "next/image";
import styles from "./TopNews.module.css";
import Link from "next/link";
import { parseDateTime } from "../../../utils/common.js";

export default function TopNews({ news }) {
  console.log(news)
  function parseDescription(articleBody) {
    // Replace all single quotes with double quotes
    const formattedString = articleBody.replace(/'/g, '"');

    // Split the article body into sections based on the "##" separator
    const sections = formattedString.split("##");

    // Remove the section titles and truncate the descriptions to 50 characters
    const sanitizedDescription = sections
      .map((section) => section.trim()) // Remove leading/trailing whitespace
      .filter((section) => section !== "") // Remove empty sections
      // .map((section) =>
      //   section.length > 50 ? section.substring(0, 50) + "..." : section
      // ) // Truncate descriptions
      .join(" "); // Join the sections back into a single string

    return sanitizedDescription.substring(0, 120) + "...";
  }

  function hangulizeGeographicZone(zone){
    const zoneMapping = {
      "Daegu": "[대구]",
      "GyeongBuk": "[경북]",
    };
    return zoneMapping[zone] || "";
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
  } else if (news?.zone) {
    imageSrc = news.img_src
  } else {
    imageSrc = "/image_press_1.jpg";
  }

  return (
    <div className={styles.M_top_news}>
      <h2 className={styles.M_title}>AI NEWS</h2>
      <Link href={`/article/${news._id}`}>
      <p className={styles.tit}>{news && news.zone ? (news.zone == "Daegu" || news.zone == "GyeongBuk" ? `${hangulizeGeographicZone(news.zone)} ` : "") : ""}{news?.summary?.title}</p>

        <p className={styles.sub_tit}>
          {news && news.timestamp && parseDescription(news.summary.article_body)}
        </p>
        <p className={styles.img}>
          <img
            src={
              news.generated_img_url
                ? news.generated_img_url?.original
                : news.original
                ? news.original
                : imageSrc
            }
            alt="News Image"
          />
        </p>
        <p className={styles.date}>
          {parseDateTime(news.read_date ? news.read_date : news.timestamp)}
        </p>
      </Link>
    </div>
  );
}
