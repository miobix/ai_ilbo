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
    const [selectedSources, setSelectedSources] = useState(['openai', 'gemini']);

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
        if (!timeStr || timeStr.length !== 6) return timeStr;
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
    };

    const handleSourceToggle = (source) => {
        setSelectedSources(prev =>
            prev.includes(source)
                ? prev.filter(s => s !== source)
                : [...prev, source]
        );
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
                                    <div className={styles.cardTitle}>{formatDate(selectedDate)} AI 뉴스 모니토링</div>
                                    <div className={styles.cardDesc}>기사 선별</div>
                                </div>
                                <div className={styles.datepickerSection}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div>
                                            <label className={styles.datepickerLabel}>날짜 선택:</label>
                                            <input
                                                type="date"
                                                value={formatDate(selectedDate)}
                                                onChange={handleDateChange}
                                                className={styles.datepicker}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSources.includes('openai')}
                                                    onChange={() => handleSourceToggle('openai')}
                                                />
                                                OpenAI
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSources.includes('gemini')}
                                                    onChange={() => handleSourceToggle('gemini')}
                                                />
                                                Gemini
                                            </label>
                                        </div>
                                    </div>
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
                                        {(() => {
                                            // Group sessions by hour
                                            const groupedByHour = sessions.reduce((acc, session) => {
                                                const time = session.time_processed;
                                                const hour = time.slice(0, 2); // Extract HH from HHMMSS
                                                if (!acc[hour]) acc[hour] = [];
                                                acc[hour].push(session);
                                                return acc;
                                            }, {});

                                            // Sort hours in descending order
                                            const sortedHours = Object.keys(groupedByHour).sort().reverse();

                                            return sortedHours.map((hour) => {
                                                const hourSessions = groupedByHour[hour];
                                                const filteredSessions = hourSessions
                                                    .filter(s => selectedSources.includes(s.ai_source))
                                                    .sort((a, b) => a.ai_source === 'openai' ? -1 : 1);

                                                if (filteredSessions.length === 0) return null;

                                                return (
                                                    <div key={hour} className={styles.timeSlotGroup}>
                                                        <h2 className={styles.timeSlotHeader}>
                                                            {hour}시
                                                        </h2>
                                                        <div className={styles.sourceComparison}>
                                                            {filteredSessions.map((session, idx) => (
                                                                <div key={idx} className={styles.articleCard}>
                                                                    <div className={styles.articleHeader}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <h3 className={styles.articleTitle}>
                                                                                {session.ai_source === 'openai' ? 'OpenAI' : 'Gemini'} - {formatTime(session.time_processed)}
                                                                            </h3>
                                                                            {session.overall_assessment && (
                                                                                <div className={styles.overallAssessment}>
                                                                                    <strong>전체 평가:</strong> {session.overall_assessment}
                                                                                </div>
                                                                            )}
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
                                                                        {session.ai_results?.map((idea, index) => (
                                                                            <li key={index} className={styles.storyIdeaItem}>
                                                                                <div className={styles.storyIdeaHeader}>
                                                                                    <span className={styles.articleNumber}>{index + 1}.</span>
                                                                                    <span className={styles.storyIdeaTitle}>{idea.title}</span>
                                                                                </div>
                                                                                <div className={styles.storyIdeaReason}>
                                                                                    {idea.reason}
                                                                                </div>

                                                                                {idea.related_sources && idea.related_sources.length > 0 && (
                                                                                    <div className={styles.relatedArticles}>
                                                                                        <strong>관련 출처:</strong>
                                                                                        <div className={styles.relatedArticlesList}>
                                                                                            {idea.related_sources.map((source, artIdx) => (
                                                                                                <div key={artIdx} className={styles.relatedArticleItem}>
                                                                                                    <span className={styles.relatedArticleNumber}>{artIdx + 1}.</span>
                                                                                                    {source.ContentID.startsWith('AKR') ? (
                                                                                                        <a
                                                                                                            href={`https://www.yna.co.kr/view/${source.ContentID}`}
                                                                                                            target="_blank"
                                                                                                            rel="noopener noreferrer"
                                                                                                            className={styles.relatedArticleLink}
                                                                                                        >
                                                                                                            {source.title || source.ContentID}
                                                                                                        </a>
                                                                                                    ) : (
                                                                                                        <span className={styles.relatedArticleText}>
                                                                                                            {source.ContentID}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
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