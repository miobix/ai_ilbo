import Image from "next/image";
import styles from "./SubArticles.module.css";
import PressRelease from "../PressRelease/PressRelease";
import {
  parseDateTime,
  parseArticleBody,
  parseFullArticleBody,
} from "../../../utils/common.js";

export default function SubArticles({ news }) {
  function isPressRelease(news) {
    return news && news.zone !== undefined;
  }

  function parseKeyTakeaways(keyTakeawaysArray) {
    return keyTakeawaysArray.map((item, index) => (
      <p key={index} className={styles.keyTakeaway}>
        {item}
      </p>
    ));
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
  } else if (news?.zone) {
    imageSrc = news.img_src
  } else {
    imageSrc = "/image_press_1.jpg";
  }

  function renderNonPressRelease(news) {
    return (
      <div className={styles.article}>
        <h3 className={styles.category}>
          {news && news.category ? news.category : "보도자료"}
        </h3>
        <p className={styles.tit}>
          {news && news.category ? (news.category == "SNS" ? `` : "") : ""}
          {news && news.summary.title}
        </p>
        <ul className={styles.datelist}>
          <li className={styles.date}>
            {news &&
              parseDateTime(news.read_date ? news.read_date : news.timestamp)}
          </li>
        </ul>
        <p className={styles.img}>
          <img
            src={
              news.generated_img_url
                ? news.generated_img_url?.original
                : imageSrc
            }
            alt="News Image"
            style={{ objectFit: news.category === "SNS" ? "contain" : "cover" }}
          />
          <p className={styles.sourceLabel}>
            {news.category === "SNS" ? "SNS 캡처" : ""}
          </p>
        </p>

        {news.summary.key_takeaways && (
          <div className={styles.keyTakeaways}>
            <h4 className={styles.keyTakeawaysTitle}>Key Takeaways:</h4>
            {news.summary.key_takeaways.map((takeaway, index) => (
              <p key={index} className={styles.keyTakeaway}>
                {takeaway}
              </p>
            ))}
          </div>
        )}
        <div className={styles.article_cnts}>
          {news && news.timestamp && isTimestampBefore(news.timestamp)
            ? parseFullArticleBody(news.summary.article_body).map(
                (section, index) => <p key={index}>{section}</p>
              )
            : parseArticleBody(news.summary.article_body).map(
                (section, index) => <p key={index}>{section}</p>
              )}
        </div>
        <br />
        <br />
        <p className={styles.footerNote}>
          {news.category === "SNS"
            ? "※ ‘SNS 뉴스’는 AI의 도움을 받아 SNS에서 활발히 활동하는 정치인들의 소식을 실시간으로 작성한 기사입니다. 이 코너에서 소개하는 정치인들은 유동적으로 변경될 수 있습니다."
            : ""}
        </p>
      </div>
    );
  }

  if (!isPressRelease(news)) {
    return renderNonPressRelease(news);
  } else {
    // Render something else for press releases if needed
    return <PressRelease news={news} />;
  }
}
