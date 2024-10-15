import Image from "next/image";
import styles from "./TopNews.module.css";
import Link from "next/link";
import { parseDateTime } from "../../../utils/common.js";

export default function TopNews({ news }) {

  function parseDescription(articleBody) {
    const sections = articleBody.split("##");

    const sanitizedDescription = sections
      .map((section) => section.trim())
      .filter((section) => section !== "") 
      // .map((section) =>
      //   section.length > 50 ? section.substring(0, 50) + "..." : section
      // ) // Truncate descriptions
      .join(" "); // Join the sections back into a single string

    return sanitizedDescription.substring(0, 120) + "...";
  }

  function hangulizeGeographicZone(zone){
    const zoneMapping = {
      "대구": "",
      "경북": "",
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
    imageSrc = news?.img_src ? news.img_src : "/press_release_defaults/now_2.jpg"
  } else {
    imageSrc = "/image_press_1.jpg";
  }

  return (
    <div className={styles.M_top_news}>
      <h2 className={styles.M_title}>AI NEWS</h2>
      <Link href={`/article/${news._id}`}>
      {/* <p className={styles.tit}>{news && news.zone ? (news.zone == "Daegu" || news.zone == "GyeongBuk" ? `${hangulizeGeographicZone(news.zone)} ` : "") : ""}{news?.summary?.title}</p> */}
      <p className={styles.tit}>{news && news.zone ? (news.zone == "대구" || news.zone == "경북" ? `${hangulizeGeographicZone(news.zone)} ` : "") : ""}{news?.summary?.title}</p>
        <p className={styles.sub_tit}>
          {news && parseDescription(news.summary.article_body)}
        </p>
        <p className={styles.img}>
          <img
            src={
              news.generated_img_url
                ? "/press_release_defaults/now_2.jpg"
                : news.original
                ? "/press_release_defaults/now_2.jpg"
                : imageSrc
            }
            alt="News Image"
          />
        </p>
        <p className={styles.date}>
          {parseDateTime(news.read_date ? news.read_date : news.timestamp ? news.timestamp : news.datetime)}
        </p>
      </Link>
    </div>
  );
}
