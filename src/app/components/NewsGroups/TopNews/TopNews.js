import Image from "next/image";
import styles from "./TopNews.module.css";
import Link from "next/link";

export default function TopNews({ news }) {
  console.log(news);
  function parseDescription(articleBody) {
    // Split the article body into sections based on the "##" separator
    const sections = articleBody.split("##");

    // Remove the section titles and truncate the descriptions to 50 characters
    const sanitizedDescription = sections
      .map((section) => section.trim()) // Remove leading/trailing whitespace
      .filter((section) => section !== "") // Remove empty sections
      .map((section) =>
        section.length > 50 ? section.substring(0, 50) + "..." : section
      ) // Truncate descriptions
      .join(" "); // Join the sections back into a single string

    return sanitizedDescription;
  }

  function parseDateTime(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hours = dateString.substring(8, 10);
    const minutes = dateString.substring(10, 12);

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }


  return (
    <div className={styles.M_top_news}>
      <h2 className={styles.M_title}>AI NEWS</h2>
      <Link href={`/article/${news._id}`}>
        <p className={styles.tit}>{news.summary.title}</p>
        <p className={styles.sub_tit}>
          {parseDescription(news.summary.article_body)}
        </p>
        <p className={styles.img}>
          <img src={news.generated_img_url.original} alt="News Image" />
        </p>
        <p className={styles.date}>{parseDateTime(news.read_date)}</p>
       </Link>
    </div>
  );
}
