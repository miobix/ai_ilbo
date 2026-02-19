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
                                                                        <div className={styles.sourceBubbles}>
                                                                            {session.sources && (() => {
                                                                                const s = session.sources;
                                                                                const bubbles = [];
                                                                                if (s.news?.count > 0)
                                                                                    bubbles.push({ label: '뉴스', count: s.news.count, tokens: s.news.estimated_tokens, color: '#1a73e8' });
                                                                                if (s.press_release?.count > 0)
                                                                                    bubbles.push({ label: '보도자료', count: s.press_release.count, tokens: s.press_release.estimated_tokens, color: '#e37400' });
                                                                                if (s.sns?.count > 0)
                                                                                    bubbles.push({ label: 'SNS', count: s.sns.count, tokens: s.sns.estimated_tokens, color: '#9334e6' });
                                                                                if (s.cafe_community) {
                                                                                    Object.entries(s.cafe_community).forEach(([name, data]) => {
                                                                                        bubbles.push({ label: name, count: data.count, tokens: data.estimated_tokens, color: '#1e8e3e' });
                                                                                    });
                                                                                }
                                                                                return bubbles.map((b, i) => (
                                                                                    <div key={i} className={styles.sourceBubble} style={{ borderColor: b.color }}>
                                                                                        <span className={styles.bubbleLabel} style={{ color: b.color }}>{b.label}</span>
                                                                                        <span className={styles.bubbleCount}>{b.count}건</span>
                                                                                        <span className={styles.bubbleTokens}>{(b.tokens / 1000).toFixed(1)}k tok</span>
                                                                                    </div>
                                                                                ));
                                                                            })()}
                                                                            <div className={styles.sourceBubble} style={{ borderColor: '#666' }}>
                                                                                <span className={styles.bubbleLabel} style={{ color: '#666' }}>전체</span>
                                                                                <span className={styles.bubbleCount}>{session.total_articles_analyzed}건</span>
                                                                                {session.sources && (
                                                                                    <span className={styles.bubbleTokens}>
                                                                                        {(Object.values(session.sources).reduce((sum, s) => {
                                                                                            if (typeof s === 'object' && 'estimated_tokens' in s) return sum + (s.estimated_tokens || 0);
                                                                                            if (typeof s === 'object') return sum + Object.values(s).reduce((s2, v) => s2 + (v?.estimated_tokens || 0), 0);
                                                                                            return sum;
                                                                                        }, 0) / 1000).toFixed(1)}k tok
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ul className={styles.mistakesList}>
                                                                        {session.ai_results?.map((idea, index) => (
                                                                            <li key={index} className={styles.storyIdeaItem} style={{
                                                                                borderLeft: `3px solid ${session.ai_source === 'openai' ? '#0066cc' : '#34a853'}`
                                                                            }}>
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
                                                                                                            {(() => {
                                                                                                                const cid = source.ContentID || '';
                                                                                                                let prefix = '';
                                                                                                                if (cid.startsWith('PR_')) prefix = '보도자료';
                                                                                                                else if (cid.startsWith('SNS_')) prefix = source.sns_profile || 'SNS';
                                                                                                                else if (cid.startsWith('CAFE_')) prefix = source.source || '카페';
                                                                                                                else if (cid.startsWith('OPINION_')) prefix = '의견';
                                                                                                                const label = source.title || cid;
                                                                                                                return (
                                                                                                                    <>
                                                                                                                        {prefix && <span className={styles.sourcePrefix}>({prefix})</span>}
                                                                                                                        {source.url ? (
                                                                                                                            <a
                                                                                                                                href={source.url}
                                                                                                                                target="_blank"
                                                                                                                                rel="noopener noreferrer"
                                                                                                                                className={styles.relatedArticleLink}
                                                                                                                            >
                                                                                                                                {label}
                                                                                                                            </a>
                                                                                                                        ) : (
                                                                                                                            label
                                                                                                                        )}
                                                                                                                    </>
                                                                                                                );
                                                                                                            })()}
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