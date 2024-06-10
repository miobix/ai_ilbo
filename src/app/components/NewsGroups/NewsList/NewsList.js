import Image from "next/image";
import styles from "./NewsList.module.css";
import HomepageNewsCard from "../../HomepageNewsCard/page";

export default function NewsList({ newsList }) {

  return (
    <div className={styles.M_list_news}>
      <ul className={styles.li_news}>
        {newsList.map((newsItem, index) => (
          <li key={index}>
            <HomepageNewsCard news={newsItem} />
          </li>
        ))}
      </ul>
    </div>
  );
}