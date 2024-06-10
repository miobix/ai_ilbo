import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import SubArticles from "../components/NewsGroups/SubArticles/SubArticles";
import SubRelated from "../components/NewsGroups/SubRelated/SubRelated";
import SubPaging from "../components/NewsGroups/SubPaging/SubPaging";

export default function ArticlePage({ params }) {
  function getNewsInfo(id) {
    let article = newsData.find((article) => article.id === id);
    if (article) {
      return article;
    } else {
      article = newsData.find((article) => article.id === "B1");
      return article
    }
  }

  const articleInfo = getNewsInfo(params.articleId)
  const relatedArticleA = getNewsInfo(articleInfo.seeAlso[0].newsId)
  const relatedArticleB = getNewsInfo(articleInfo.seeAlso[1].newsId)


  return (
    <main className={styles.main}>
         <Header />
    
        {/*SUB article*/}
        <div className={styles.sub_cont}>
            <div className={styles.sub_inner}>
              <div className={styles.article_section}>
                <SubArticles />
                <SubRelated />
              </div>
               <SubPaging />
               <a href="#none" className={styles.ListBtn}>목록</a>
            </div>
        </div>
    
        <Footer />
              
    </main>
  );
}