import styles from "./AllNewsSection.module.css";
import Link from "next/link";
import NewsArticle from "@/components/NewsDisplay/NewsArticle/NewArticle";
import newsData from "../../../newsData.json";

export default function AllNewsSection() {
  function getNewsInfo(id) {
    let article = newsData.find((article) => article.id === id);
    if (article) {
      return article;
    } else {
      article = newsData.find((article) => article.id === "B1");
      return article
    }
  }

  const allNews = {
    item1: getNewsInfo("B1"),
    item2: getNewsInfo("B2"),
    item3: getNewsInfo("B3"),
    item4: getNewsInfo("B4"),
    item5: getNewsInfo("B5"),
    item6: getNewsInfo("E1"),
    item7: getNewsInfo("E2"),
    item8: getNewsInfo("E3"),
    item9: getNewsInfo("E4"),
    item10: getNewsInfo("E5"),
  };

  const route = "/category/allNews";

  return (
    <div className={styles.root}>
      <div className={styles.divsContainer}>
        <div className={styles.allNews}>
        <Link href={route}>
          <div className={styles.sectionHeader}>
            <h3>All News &raquo;</h3>
          </div>
          </Link>
          <div className={styles.newsList}>
           <NewsArticle display="newsList" articleInfo={allNews.item1}/>
           <NewsArticle display="newsList" articleInfo={allNews.item2}/>
           <NewsArticle display="newsList" articleInfo={allNews.item3}/>
           <NewsArticle display="newsList" articleInfo={allNews.item4}/>
           <NewsArticle display="newsList" articleInfo={allNews.item5}/>
           <NewsArticle display="newsList" articleInfo={allNews.item6}/>
           <NewsArticle display="newsList" articleInfo={allNews.item7}/>
           <NewsArticle display="newsList" articleInfo={allNews.item8}/>
           <NewsArticle display="newsList" articleInfo={allNews.item9}/>
           <NewsArticle display="newsList" articleInfo={allNews.item10}/>
          </div>
          <div className={styles.paginationComponent}> Custom react-pagination placeholder [1] 2 3 ... 1000</div>
        </div>
      </div>
    </div>
  );
}
