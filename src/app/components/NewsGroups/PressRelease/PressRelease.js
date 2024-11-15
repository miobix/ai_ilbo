import styles from "./PressRelease.module.css";
import { parseDateTime, parseArticleBody, parseFullArticleBody } from "../../../utils/common.js";
import { useEffect } from "react";
import * as utils from "../../../utils/common.js";

export default function PressRelease({ news }) {
  let imageSrc = utils.getInternalImageSource(news);
  let displayTime = news.read_date ? news.read_date : news.timestamp

  return (
    <div className={styles.article}>
      <h3 className={styles.category}>
        {news && news.category ? news.category : "보도자료"}
      </h3>
        <p className={styles.tit}>{news?.summary?.title}</p>
      <ul className={styles.datelist}>
        <li className={styles.date}>
          {news && parseDateTime(displayTime)}
        </li>
      </ul>
      <p className={styles.img}>
        <img src={imageSrc} alt="News Image"/>
          <p className={styles.sourceLabel}></p>
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
      {news && parseArticleBody(news.summary.article_body).map(
                (section, index) => <p key={index}>{section}</p>
              )}
      </div>

      { 
        (news?.iframe_src || news?.link) && <div className={styles.iframeContainer}>
        <h3 className={`${styles.category} ${styles.centerHeader}`}>
          {"원본"}
        </h3>
        <p className={styles.divLine}> </p>
        { news?.iframe_src ?
        <iframe
          src={news.iframe_src}
          allowFullScreen
          className={styles.iframe}
          id="Iframe"
          frameborder="0"
          height="100%"
          width="100%"
        ></iframe>
        :
          <p class={styles.hyperlink}><a href={news?.link}>원본을 바로가기</a></p>
        }
      </div>

      }
      
    </div>
  );
}
