"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import TopNews from "../../components/NewsGroups/TopNews/TopNews";
import NewsList from "../../components/NewsGroups/NewsList/NewsList";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { redirect } from 'next/navigation';

export default function CategoryPage({ params }) {
  const [allNews, setAllNews] = useState([]);

  console.log(params.categoryId)

  //if params.categoryId is not "1a" or "pressrelease" redirect to "/"
  useEffect(() => {
    if (params.categoryId !== '1a' && params.categoryId !== 'pressrelease') {
      redirect('/');
    }
  }, [params.categoryId]);


  // fetch all news from db
  const environment = process.env.NEXT_PUBLIC_ENV;
  const baseString =
    environment === "dev"
      ? "http://localhost:3000/"
      : "https://www.yeongnam.ai/";

  useEffect(() => {
    if(params.categoryId == '1a'){
      fetch("/api/fetchHomepageNews")
      .then((response) => response.json())
      .then((data) => setAllNews(data))
      .catch((error) => console.error("Error fetching data:", error));
    }
    else if(params.categoryId == 'pressrelease'){
      fetch("/api/fetchPressDocs")
      .then((response) => response.json())
      .then((data) => setAllNews(data))
      .catch((error) => console.error("Error fetching data:", error));
    }
    

  }, []);


  if (!allNews) {
    // If news data is not available yet, return a loading indicator or null
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
