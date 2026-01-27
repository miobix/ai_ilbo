"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Curation() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const fetchCuration = async () => {
      setLoading(true);
      try {
        const dateStr = formatDate(selectedDate);
        const response = await fetch(`/api/fetchNewsCuration?date=${dateStr}`);
        const data = await response.json();
        setSessions(data.sessions || []);
        setTotalSessions(data.sessions?.length || 0);
      } catch (error) {
        console.error("Error fetching curation:", error);
        setSessions([]);
        setTotalSessions(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCuration();
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

  const formatTime = (timeStr) => {
    // Convert HHMMSS to HH:MM:SS
    if (!timeStr || timeStr.length !== 6) return timeStr;
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
  };

  return (
    <main className={styles.main}>
      <Header />

      {/* Date Picker Header */}
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>{formatDate(selectedDate)} AI 뉴스 큐레이션</div>
                  <div className={styles.cardDesc}>연합뉴스 기사 선별 및 요약</div>
                </div>
                <div className={styles.datepickerSection}>
                  <label className={styles.datepickerLabel}>날짜 선택:</label>
                  <input 
                    type="date" 
                    value={formatDate(selectedDate)} 
                    onChange={handleDateChange} 
                    className={styles.datepicker} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>큐레이션 세션 목록 ({totalSessions})</div>
              </div>
              <div className={styles.cardContent}>
                {loading ? (
                  <div className={styles.loadingText}>데이터 로딩 중...</div>
                ) : sessions.length === 0 ? (
                  <div className={styles.emptyText}>해당 날짜에 큐레이션 데이터가 없습니다.</div>
                ) : (
                  <div className={styles.articlesList}>
                    {sessions.map((session, idx) => (
                      <div key={idx} className={styles.articleCard}>
                        <div className={styles.articleHeader}>
                          <div style={{ flex: 1 }}>
                            <h3 className={styles.articleTitle}>
                              처리 시각: {formatTime(session.time_processed)}
                            </h3>
                            {session.selection_reason && (
                              <div className={styles.selectionReason}>
                                {session.selection_reason}
                              </div>
                            )}
                          </div>
                          <span className={styles.mistakeCount}>
                            {session.total_articles_analyzed}개 분석
                          </span>
                        </div>
                        <ul className={styles.mistakesList}>
                          {session.ai_results?.map((article, index) => (
                            <li key={index} className={styles.curationItem}>
                              <span className={styles.articleNumber}>{index + 1}.</span>
                              <span className={styles.articleTitleText}>{article.original_title}</span>
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