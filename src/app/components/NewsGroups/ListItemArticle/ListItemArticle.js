import styles from "./ListItemArticle.module.css";
import Link from "next/link";
import * as utils from "../../../utils/common.js";

export default function ListItemArticle({ news }) {

  let imageSrc = utils.getInternalImageSource(news);
  let displayedTime = news.read_date ? news.read_date : news.timestamp

  return (
    <Link href={`/article/${news._id}`}>
      <p className={styles.img}>
        <img src={imageSrc} alt="News Image"/>
      </p>
      <div className={styles.cnt}>
      <p className={styles.tit}>{news?.summary?.title}</p>
        <p className={styles.cont}>
        {news.timestamp && utils.generateShortArticleDescription(news.summary.article_body)}
        </p>
        <p className={styles.date}>
          {utils.parseDateTime(displayedTime)}
        </p>
      </div>
    </Link>
  );
}
