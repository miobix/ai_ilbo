import styles from "./RecommendedNews.module.css";
import NewsArticle from "@/components/NewsDisplay/NewsArticle/NewArticle";
import newsData from "../../../newsData.json";

export default function RecommendedNews() {
  function getNewsInfo(id) {
    let article = newsData.find((article) => article.id === id);
    if (article) {
      return article;
    } else {
      article = newsData.find((article) => article.id === "B1");
      return article
    }
  }
  
  const recommendedNews = {
    rn1: getNewsInfo("NV9"),
    rn2: getNewsInfo("E9"),
    rn3: getNewsInfo("C9"),
    rn4: getNewsInfo("B9"),
  };

  return (
    <div className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>Recommended</h3>
      </div>
      <div className={styles.newsContainer}>
        <NewsArticle display="recNews" articleInfo={recommendedNews.rn1} />
        <NewsArticle display="recNews" articleInfo={recommendedNews.rn2} />
        <NewsArticle display="recNews" articleInfo={recommendedNews.rn3}/>
        <NewsArticle display="recNews" articleInfo={recommendedNews.rn4}/>
      </div>
    </div>
  );
}
