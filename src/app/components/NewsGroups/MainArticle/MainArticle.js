import Image from "next/image";
import styles from "./MainArticle.module.css";
import * as utils from "../../../utils/common.js";

export default function MainArticle({ news }) {

  let displayDate = news.read_date ? news.read_date : news.timestamp
  let imageSrc = utils.getInternalImageSource(news);

  if (!news) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.article}>
      <h3 className={styles.category}>
        {news && news.category ? news.category : "보도자료"}
      </h3>
      <p className={styles.tit}>
        {news && news.summary.title}
      </p>
      <ul className={styles.datelist}>
        <li className={styles.date}>
          {news && utils.parseDateTime(displayDate)}
        </li>
      </ul>
      <p className={styles.img}>
        <img src={imageSrc} alt="News Image" style={{ objectFit: news.category === "SNS" ? "contain" : "cover" }}
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
        {news && utils.parseArticleBody(news.summary.article_body).map((section, index) => <p key={index}>{section}</p>)}
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
