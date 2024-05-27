import styles from "./NewsCategory.module.css";
import Link from "next/link";
import NewsArticle from "@/components/NewsDisplay/NewsArticle/NewArticle";
import newsData from "../../../newsData.json";

export default function NewsCategory({ categoryTag }) {
  let categoryInitials = "";
  let categoryTitle = "";
  switch (categoryTag) {
    case "environment":
      categoryInitials = "NV";
      categoryTitle = "Environment";
      break;
    case "batteries":
      categoryInitials = "B";
      categoryTitle = "Batteries";
      break;
    case "economy":
      categoryInitials = "E";
      categoryTitle = "Economy";
      break;
    case "construction":
      categoryInitials = "C";
      categoryTitle = "Construction";
      break;
    default:
      console.log(`Could not match ${categoryTag}.`);
  }

  function getNewsInfo(id) {
    let article = newsData.find((article) => article.id === id);
    if (article) {
      return article;
    } else {
      article = newsData.find((article) => article.id === "B1");
      return article;
    }
  }

  const categoryNews = {
    categoryTopOne: getNewsInfo(`${categoryInitials}1`),
    categoryTopTwo: getNewsInfo(`${categoryInitials}2`),
    categoryTopThree: getNewsInfo(`${categoryInitials}3`),
    categoryTopFour: getNewsInfo(`${categoryInitials}4`),
  };

  const route = `/category/${categoryTag}`;

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <Link href={route}>
          <h3>{categoryTitle} &raquo;</h3>
        </Link>
      </div>
      <div className={styles.categoryContainer}>
        <NewsArticle
          display="catHeadliner"
          articleInfo={categoryNews.categoryTopOne}
        />
        <NewsArticle
          display="catArticle"
          articleInfo={categoryNews.categoryTopTwo}
        />
        <NewsArticle
          display="catArticle"
          articleInfo={categoryNews.categoryTopThree}
        />
        <NewsArticle
          display="catArticle"
          articleInfo={categoryNews.categoryTopFour}
        />
      </div>
    </div>
  );
}
