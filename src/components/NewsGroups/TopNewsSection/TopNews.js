import NewsArticle from "@/components/NewsDisplay/NewsArticle/NewArticle";
import styles from "./TopNews.module.css";
import newsData from "../../../newsData.json";

export default function TopNews() {
  function getNewsInfo(id) {
    let article = newsData.find((article) => article.id === id);
    if (article) {
      return article;
    } else {
      article = newsData.find((article) => article.id === "B1");
      return article
    }
  }

    //placeholder top news
    const topNews = {
      topNews: getNewsInfo("B1"),
      midNewsOne: getNewsInfo("B2"),
      midNewsTwo: getNewsInfo("B3"),
      midNewsThree: getNewsInfo("B4"),
    };


  return (
    <div className={styles.root}>
      <div className={styles.divsContainer}>
        <div className={`${styles.leftDiv} ${styles.topNewsDiv}`}>
          <NewsArticle display="bigNews" articleInfo={topNews.topNews} />
        </div>
        <div className={`${styles.rightDiv} ${styles.topNewsDiv}`}>
          <div className={styles.newsArticle}>
            <NewsArticle
              display="midNews"
              articleInfo={topNews.midNewsOne}
            />
          </div>
          <div className={styles.newsArticle}>
            <NewsArticle
              display="midNews"
              articleInfo={topNews.midNewsTwo}
            />
          </div>
          <div className={styles.newsArticle}>
            <NewsArticle
              display="midNews"
              articleInfo={topNews.midNewsThree}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
