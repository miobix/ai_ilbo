"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import TopNews from "./components/NewsGroups/ListHeaderArticle/ListHeaderArticle";
import NewsList from "./components/NewsGroups/NewsList/NewsList";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [allNews, setAllNews] = useState([]);

  // fetch all news from db

  const environment = process.env.NEXT_PUBLIC_ENV;
  const baseString =
    environment === "dev"
      ? "http://localhost:3000/"
      : "https://www.yeongnam.ai/";

  useEffect(() => {
    fetch("/api/fetchEmailPress")
      .then((response) => response.json())
      .then((data) => setAllNews(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!allNews) {
    return <div>Loading...</div>;
  }


  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.main_inner}>
        {/*Main News*/}
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            {allNews.length > 0 && <TopNews news={allNews[0]} />}

            {allNews.length > 1 && <NewsList newsList={allNews.slice(1)} />}
            {/*Paging*/}
            <div className={styles.Paging}>
              <button>prev</button>
              <ul className={styles.paging_list}>
                <li>
                  <a href="#none">1</a>
                </li>
                <li>
                  <a href="#none">2</a>
                </li>
                <li>
                  <a href="#none">3</a>
                </li>
                <li>
                  <a href="#none">4</a>
                </li>
                <li>
                  <a href="#none">5</a>
                </li>
                <li>
                  <a href="#none">6</a>
                </li>
              </ul>
              <button>next</button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
