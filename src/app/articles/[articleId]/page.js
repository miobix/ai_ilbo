import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import styles from "../../articles/[articleId]/page.module.css";
import ColumnList from "@/components/NewsGroups/ColumnList/ColumnList";
import Image from "next/image";
import NewsArticle from "@/components/NewsDisplay/NewsArticle/NewArticle";
import newsData from "../../../newsData.json";

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
      <section>
        <Header />

        <div className={styles.rootContainer}>
          <div className={styles.leftGutter}></div>
          <div className={styles.articleBody}>
            <div className={styles.articleHeader}>
              <p className={styles.categoryTag}>{articleInfo.category}</p>
              <h1 className={styles.articleTitle}>
                {articleInfo.title}
              </h1>
              <p className={styles.articleSubheader}>
              {articleInfo.description}
              </p>
              <p className={styles.authorInfo}>
                By  {articleInfo.author} - <span> {articleInfo.publishedDate}</span>
              </p>
            </div>
            <div className={styles.articleImage}>
              <Image
                src="https://media.istockphoto.com/id/545102878/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%ED%82%A4%EB%B3%B4%EB%93%9C-%EA%B0%9C%EB%85%90-%ED%99%98%EC%98%81.jpg?s=2048x2048&w=is&k=20&c=erlw4gH9RQFFdWtkqNZ9HK4e2C_ECt1iV6x9BHl4jcE="
                alt="Description of the image"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                width={500}
                height={400}
                placeholder="empty"
              />
            </div>
            <div className={styles.articleBody}>
              <section>
                <p className={styles.subheaderTitle}>Key Takeaways</p>
                <ul className={styles.listContainer}>
                  <li className={styles.listItem}>
                  {articleInfo.summary.firstSummary}
                  </li>
                  <li className={styles.listItem}>
                  {articleInfo.summary.secondSummary}
                  </li>
                  <li className={styles.listItem}>
                  {articleInfo.summary.thirdSummary}
                 
                  </li>
                </ul>
              </section>
              <section>
                <p className={styles.subheaderTitle}> {articleInfo.newsBody[0].sectionTitle}</p>
                <p className={styles.textBody}>
                {articleInfo.newsBody[0].sectionText}
                </p>
              </section>
              <section>
                <p className={styles.subheaderTitle}>{articleInfo.newsBody[1].sectionTitle}</p>
                <p className={styles.textBody}>
                {articleInfo.newsBody[1].sectionText}
                </p>
              </section>
              <section>
                <p className={styles.subheaderTitle}>{articleInfo.newsBody[2].sectionTitle}</p>
                <p className={styles.textBody}>
                {articleInfo.newsBody[2].sectionText}</p>
              </section>
              <div className={styles.relatedContent}>
                <p className={styles.label}>
                  Explore Tags: 
                  <span className={styles.hashtag}>{articleInfo.hashtags[0]}</span>
                  
                  <span className={styles.hashtag}>
                  {articleInfo.hashtags[1]}
                  </span>
                 
                </p>
                <br />

                <p className={styles.label}>Related News</p>
                <div className={styles.relatedNewsDisplay}>
                  <NewsArticle display="midNews" articleInfo={relatedArticleA} />
                  <NewsArticle display="midNews" articleInfo={relatedArticleB}/>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rightGutter}>
            <ColumnList columnTitle="Most Read" content="mostRead" />
            <ColumnList columnTitle="Top Stories" content="topNews"/>
          </div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
