import Image from "next/image";
import styles from "./SubArticles.module.css";
import PressRelease from "../PressRelease/PressRelease";
import { parseDateTime, parseArticleBody } from "../../../utils/common.js";

export default function SubArticles({ news }) {
  function isPressRelease(news) {
    return news && news.iframe_src !== undefined;
  }

  function parseKeyTakeaways(keyTakeawaysArray) {
    return keyTakeawaysArray.map((item, index) => (
      <p key={index} className={styles.keyTakeaway}>
        {item}
      </p>
    ));
  }

  if (!news) {
    // If news data is not available yet, return a loading indicator or null
    return <div>Loading...</div>;
  }

  const imageSrc = news?.img_src
  ? `/${news.img_src}.jpg`
  : news?.category === "SNS"
    ? (news.post_images && news.post_images.length > 0
        ? `${news.post_images[0]}`
        : `/sns_profile_pictures/${news.sns_profile}.png`)
    : "/image_press_1.jpg";

  function renderNonPressRelease(news) {
    return (
      <div className={styles.article}>
        <h3 className={styles.category}>
          {news && news.category ? news.category : "보도자료"}
        </h3>
        <p className={styles.tit}>
          {news && news.category
            ? news.category == "SNS"
              ? `[${news.sns_profile}]`
              : ""
            : ""}
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
            style={{objectFit: news.category === 'SNS' ? 'contain' : 'cover'}}
          />
         <p className={styles.sourceLabel}>부제</p>
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
          {parseArticleBody(news.summary.article_body).map((section, index) => (
            <p key={index}>{section}</p>
          ))}
        </div>
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
