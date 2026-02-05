"use client";
import React, { useEffect, useState } from "react";
import styles from "../../chart.module.css";
import DailyArticleStats from "./DailyArticleStats";
import WebArticleList from "./WebArticleList";
import WebArticleDeptChart from "./WebArticleDeptChart";

const StatsSection = () => {
  const [articlesData, setArticlesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/fetchWMSArticles');
        if (res.status === 204) { setArticlesData([]); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setArticlesData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticlesData();
  }, []);

  if (loading) return <div className={styles.card}><div className={styles.cardContent}>데이터를 불러오는 중...</div></div>;
  if (error) return <div className={styles.card}><div className={styles.cardContent}>에러: {error}</div></div>;

  return (
    <>
      {/* <DailyArticleStats newsData={articlesData} />
      <WebArticleDeptChart webArticleData={articlesData} /> */}
      <WebArticleList webArticleData={articlesData} />
    </>
  );
};

export default StatsSection;
