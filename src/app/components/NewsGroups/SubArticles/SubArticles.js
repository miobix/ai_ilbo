import Image from "next/image";
import styles from "./SubArticles.module.css";

export default function SubArticles({news}) {
  console.log(news)

  function parseDateTime(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hours = dateString.substring(8, 10);
    const minutes = dateString.substring(10, 12);

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }



  function parseArticleBody(articleBodyString) {
    // Split the article body into sections based on the "##" separator
    const sections = articleBodyString.split("##");
  
    // Remove the empty sections and trim whitespace from each section
    const parsedSections = sections
      .filter((section) => section.trim() !== "")
      .map((section) => section.trim());
  
    return parsedSections;
  }


  if (!news) {
    // If news data is not available yet, return a loading indicator or null
    return <div>Loading...</div>;
  }

  
  return (

    <div className={styles.article}>
              <h3 className={styles.category}>{news && news.category}</h3>
              <p className={styles.tit}>{news && news.summary.title}</p>
              <ul className={styles.datelist}>
                {/* <li className={styles.name}>정지윤</li> */}
                <li className={styles.date}>{news && parseDateTime(news.read_date)}</li>
                {/* <li className={styles.date}>수정 2024-06-07 10:29</li>
                <li className={styles.date}>발행일 2024-06-07 10:29</li> */}
              </ul>
              <p className={styles.img}><img src={news.generated_img_url?.original} /></p>
              {/* <p className={styles.imgtxt}>경북 포항 영일만 일대에 최대 140억배럴 규모의 석유·가스가 매장돼 있을 가능성이 있다고 분석한 미국 액트지오(Act-Geo)의 비토르 아브레우대표가 7일 오전 정부세종청사 산업통상자원부 기자실에서 동해 심해 가스전 개발과 관련한 브리핑을 하고 있다. 연합뉴스</p> */}
              <div className={styles.article_cnts}>
        {parseArticleBody(news.summary.article_body).map((section, index) => (
          <p key={index}>{section}</p>
        ))}
      </div>
              {/* <span className={styles.name}>정지윤 기자</span> */}
            </div>

  );
}
