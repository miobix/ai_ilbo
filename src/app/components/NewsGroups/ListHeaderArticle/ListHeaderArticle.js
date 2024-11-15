import styles from "./ListHeaderArticle.module.css";
import Link from "next/link";
import * as utils from "../../../utils/common.js";

export default function TopNews({ news }) {

  let imageSrc = utils.getInternalImageSource(news)
  let displayedTime = news.read_date ? news.read_date : news.timestamp ? news.timestamp : news.datetime

  return (
    <div className={styles.M_top_news}>
      <h2 className={styles.M_title}>AI NEWS</h2>
      <Link href={`/article/${news._id}`}>
      <p className={styles.tit}>{news?.summary?.title}</p>
        <p className={styles.sub_tit}>
          {news && utils.generateShortArticleDescription(news.summary.article_body)}
        </p>
        <p className={styles.img}>
          <img src={imageSrc} alt="News Image"/>
        </p>
        <p className={styles.date}>
          {utils.parseDateTime(displayedTime)}
        </p>
      </Link>
    </div>
  );
}
