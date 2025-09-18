"use client";
import React, { useEffect, useState } from "react";
import styles from "../../chart.module.css";
import LevelChart from "./LevelChart";
import ViewChart from "./ViewChart";
import DepartmentViewTable from "./DepartmentViewTable";
import PersonalViewTable from "./PersonalViewTable";
import ArticleViewTable from "./ArticleViewTable";

const ViewsSection = () => {
  const [active, setActive] = useState("department");
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const params = new URLSearchParams({ from: oneYearAgo.toISOString(), to: new Date().toISOString() });
      const res = await fetch(`/api/fetchAllArticles?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllArticles(data || []);
    } catch (e) {
      setError(e.message);
      setAllArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className={styles.card}><div className={styles.cardContent}>데이터를 불러오는 중...</div></div>;
  if (error) return <div className={styles.card}><div className={styles.cardContent}>에러: {error}</div></div>;
  if (!allArticles.length) return <div className={styles.card}><div className={styles.cardContent}>표시할 데이터가 없습니다</div></div>;

  return (
    <>
      <LevelChart newsData={allArticles} />
      <ViewChart newsData={allArticles} />
      <div className={styles.tabsBar}>
        <button className={`${styles.tabBtn} ${active === 'department' ? styles.active : ''}`} onClick={() => setActive('department')}>부서별 조회수</button>
        <button className={`${styles.tabBtn} ${active === 'reporter' ? styles.active : ''}`} onClick={() => setActive('reporter')}>기자별 조회수</button>
        <button className={`${styles.tabBtn} ${active === 'article' ? styles.active : ''}`} onClick={() => setActive('article')}>기사별 조회수</button>
      </div>
      <div>
        {active === 'department' && <DepartmentViewTable newsData={allArticles} />}
        {active === 'reporter' && <PersonalViewTable newsData={allArticles} />}
        {active === 'article' && <ArticleViewTable newsData={allArticles} />}
      </div>
    </>
  );
};

export default ViewsSection;
