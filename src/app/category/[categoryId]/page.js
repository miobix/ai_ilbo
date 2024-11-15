"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import TopNews from "../../components/NewsGroups/ListHeaderArticle/ListHeaderArticle";
import NewsList from "../../components/NewsGroups/NewsList/NewsList";
import React from "react";
import useFetchCategoryData from "../../hooks/useFetchCategoryData";

export default function CategoryPage({ params }) {
  const allNews = useFetchCategoryData(params.categoryId); 

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
            {/* <div className={styles.Paging}>
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
            </div> */}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
