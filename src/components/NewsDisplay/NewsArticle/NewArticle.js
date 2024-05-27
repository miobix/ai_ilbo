import Link from "next/link";
import commonStyles from "./NewsArticle.module.css";
import bigNewsStyles from "./BigNews.module.css";
import catArticleStyles from "./CatArticle.module.css";
import catHeadlinerStyles from "./CatHeadliner.module.css";
import midNewsStyles from "./MidNews.module.css";
import newsSnippetStyles from "./NewsSnippet.module.css";
import newsTitleSnippetStyles from "./NewsTitleSnippet.module.css";
import recNewsStyles from "./RecNews.module.css";
import newsListStyles from "./NewsList.module.css";
import Image from "next/image";

const styleMap = {
  bigNews: { display: bigNewsStyles, imageWidth: 500, imageHeight: 200 },
  catArticle: { display: catArticleStyles, imageWidth: 100, imageHeight: 70 },
  catHeadliner: {
    display: catHeadlinerStyles,
    imageWidth: 180,
    imageHeight: 140,
  },
  midNews: { display: midNewsStyles, imageWidth: 180, imageHeight: 140 },
  newsSnippet: { display: newsSnippetStyles, imageWidth: 100, imageHeight: 80 },
  newsTitleSnippet: {
    display: newsTitleSnippetStyles,
    imageWidth: 160,
    imageHeight: 120,
  },
  recNews: { display: recNewsStyles, imageWidth: 160, imageHeight: 120 },
  newsList: { display: newsListStyles, imageWidth: 100, imageHeight: 80 },
};

export default function NewsArticle({ display, articleInfo }) {
  const styles = styleMap[display]?.display || commonStyles;
  const articleRoute = `/articles/${articleInfo.id}`;
  //const articleRoute = "/articles/hello"

  return (
    <Link href={articleRoute}>
      <div className={styles.root}>
        <div className={styles.newsPiece}>
          {display === "newsTitleSnippet" && (
            <div className={styles.number}>1</div>
          )}
          <div className={styles.image}>
            <Image
              src="https://media.istockphoto.com/id/545102878/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%ED%82%A4%EB%B3%B4%EB%93%9C-%EA%B0%9C%EB%85%90-%ED%99%98%EC%98%81.jpg?s=2048x2048&w=is&k=20&c=erlw4gH9RQFFdWtkqNZ9HK4e2C_ECt1iV6x9BHl4jcE="
              alt="Description of the image"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
              width={styleMap[display]?.imageWidth || 100}
              height={styleMap[display]?.imageHeight || 80}
              placeholder="empty"
            />
          </div>
          <div className={styles.columnWrapper}>
            <h2 className={styles.title}>{articleInfo.title}</h2>
            <p className={styles.timeAgo}>{articleInfo.writingDate}</p>
            <p className={styles.description}>{articleInfo.description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
