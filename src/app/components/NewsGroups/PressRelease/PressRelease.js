import styles from "./PressRelease.module.css";
import { parseDateTime, parseArticleBody } from "../../../utils/common.js";
import { useEffect } from "react";

export default function PressRelease({ news }) {
  const imageSrc = news.img_src ? `/${news.img_src}.jpg` : "/image_press_1.jpg";
  return (
    <div className={styles.article}>
      <h3 className={styles.category}>
        {news && news.category ? news.category : "보도자료"}
      </h3>

      <p className={styles.tit}>{news && news.summary.title}</p>
      <ul className={styles.datelist}>
        {/* <li className={styles.name}>정지윤</li> */}
        <li className={styles.date}>
          {news &&
            parseDateTime(news.read_date ? news.read_date : news.timestamp)}
        </li>
        {/* <li className={styles.date}>수정 2024-06-07 10:29</li>
                <li className={styles.date}>발행일 2024-06-07 10:29</li> */}
      </ul>
      <p className={styles.img}>
        <img
          src={
            news.generated_img_url ? news.generated_img_url?.original : imageSrc
          }
        />
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
      {/* <p className={styles.imgtxt}>경북 포항 영일만 일대에 최대 140억배럴 규모의 석유·가스가 매장돼 있을 가능성이 있다고 분석한 미국 액트지오(Act-Geo)의 비토르 아브레우대표가 7일 오전 정부세종청사 산업통상자원부 기자실에서 동해 심해 가스전 개발과 관련한 브리핑을 하고 있다. 연합뉴스</p> */}
      <div className={styles.article_cnts}>
        {parseArticleBody(news.summary.article_body).map((section, index) => (
          <p key={index}>{section}</p>
        ))}
      </div>
      {/* <span className={styles.name}>정지윤 기자</span> */}

      <div className={styles.iframeContainer}>
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
    </div>
  );
}
