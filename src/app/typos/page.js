"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Typos() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  // Add sample data
  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypos = async () => {
      setLoading(true);
      try {
        const dateStr = formatDate(selectedDate);
        const response = await fetch(`/api/fetchSpellingsWithTitle?date=${dateStr}`);
        const data = await response.json();

        // Filter out spacing errors and recalculate counts
        const filteredArticles = (data.articles || [])
          .map((article) => {
            const filteredSpellings = article.spellings.filter((spelling) => spelling.reason !== "띄어쓰기 오류");
            return {
              ...article,
              spellings: filteredSpellings,
              mistakes_count: filteredSpellings.length,
            };
          })
          .filter((article) => article.mistakes_count > 0); // Remove articles with 0 mistakes
        console.log("Filtered Articles:", filteredArticles);
        setArticles(filteredArticles);
        setTotalCount(filteredArticles.reduce((sum, article) => sum + article.mistakes_count, 0));
      } catch (error) {
        console.error("Error fetching typos:", error);
        setArticles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTypos();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <main className={styles.main}>
      <Header />

      {/* Summary Header */}
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>{formatDate(selectedDate)} 오탈자 통계</div>
                  <div className={styles.cardDesc}>{/* <span className={styles.planningLabel}>등급1 : 기획</span>,<span className={styles.nonPlanningLabel}>나머지 등급 : 비기획</span> */}</div>
                </div>
                <div className={styles.datepickerSection}>
                  <label className={styles.datepickerLabel}>날짜 선택:</label>
                  <input type="date" value={formatDate(selectedDate)} onChange={handleDateChange} className={styles.datepicker} />
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.grid} ${styles.grid3}`}>
                  <div className={`${styles.grid} ${styles.grid3}`}>
                    {" "}
                    <div className={styles.subCard}>
                      <div className={styles.cardHeader}>
                        <div>
                          <div className={styles.cardTitle}>기사 수</div>
                        </div>
                      </div>
                      <div className={styles.cardContentGrow}>
                        <div className={`${styles.statValue} ${styles.statEmphGreen}`}>{loading ? "..." : `${articles.length}개`}</div>
                      </div>
                    </div>
                    <div className={styles.subCard}>
                      <div className={styles.cardHeader}>
                        <div>
                          <div className={styles.cardTitle}>오탈자 수</div>
                        </div>
                      </div>
                      <div className={styles.cardContentGrow}>
                        <div className={`${styles.statValue} ${styles.statEmphRed}`}>{loading ? "..." : `${totalCount}개`}</div>
                      </div>
                    </div>
                    <div className={styles.subCard}>
                      <div className={styles.cardHeader}>
                        <div>
                          <div className={styles.cardTitle}>기사당 평균</div>
                        </div>
                      </div>
                      <div className={styles.cardContentGrow}>
                        <div className={`${styles.statValue} ${styles.statEmphOrange}`}>{loading ? "..." : articles.length > 0 ? `${(totalCount / articles.length).toFixed(1)}개` : "0개"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>오탈자 상세 목록</div>
              </div>
              <div className={styles.cardContent}>
                {loading ? (
                  <div className={styles.loadingText}>데이터 로딩 중...</div>
                ) : articles.length === 0 ? (
                  <div className={styles.emptyText}>해당 날짜에 오탈자가 없습니다.</div>
                ) : (
                  <div className={styles.articlesList}>
                    {articles.map((article) => (
                      <div key={article.nid} className={styles.articleCard}>
                        <div className={styles.articleHeader}>
  <div style={{ flex: 1 }}>
    {article.newskey ? (
      <a href={`https://www.yeongnam.com/web/view.php?key=${article.newskey}`} target="_blank" rel="noopener noreferrer" className={styles.articleTitleLink}>
        <h3 className={styles.articleTitle}>{article.title}</h3>
      </a>
    ) : (
      <h3 className={styles.articleTitle}>{article.title}</h3>
    )}
    {article.author && <div className={styles.articleAuthor}>{article.author}</div>}
  </div>
  <span className={styles.mistakeCount}>{article.mistakes_count}개</span>
</div>
                        <ul className={styles.mistakesList}>
                          {article.spellings.map((spelling, index) => (
                            <li key={index} className={styles.mistakeItem}>
                              <span className={styles.mistakeText}>{spelling.mistake}</span>
                              <span className={styles.arrow}>→</span>
                              <span className={styles.suggestionText}>{spelling.suggestion}</span>
                              <span className={styles.reasonText}>({spelling.reason})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
