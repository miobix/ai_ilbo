
import styles from './ColumnList.module.css'
import NewsArticle from '@/components/NewsDisplay/NewsArticle/NewArticle'
import newsData from "../../../newsData.json";
/*
snippetType options
numbered: To make listst, like top news or most read
flat: news snippet without number, but wiht an image

content
topnews, mostrecent, mostviewed
*/

export default function ColumnList({columnTitle, snippetType="flat" , content}){
    function getNewsInfo(id) {
        let article = newsData.find((article) => article.id === id);
        if (article) {
          return article;
        } else {
          article = newsData.find((article) => article.id === "B1");
          return article
        }
      }

      const columnTop = {
        item1: getNewsInfo("B1"),
        item2: getNewsInfo("B2"),
        item3: getNewsInfo("B3"),
        item4: getNewsInfo("B4"),
        item5: getNewsInfo("B5"),
        item6: getNewsInfo("B6"),
        item7: getNewsInfo("B7"),
        item8: getNewsInfo("B8"),
        item9: getNewsInfo("B9"),
        item10: getNewsInfo("B10"),
      };

    return (
        <div className={styles.container}>
            <h3 className={styles.headline}>
            {columnTitle}
                </h3>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item1}/>
            <div className={styles.faintLine}></div>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item2}/>
            <div className={styles.faintLine}></div>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item3}/>
            <div className={styles.faintLine}></div>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item4}/>
            <div className={styles.faintLine}></div>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item5}/>
            <div className={styles.faintLine}></div>
            <NewsArticle display={snippetType === "numbered" ? "newsTitleSnippet" :"newsSnippet" } articleInfo={columnTop.item6}/>
        </div>
    )
}



