"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { getLevelClass } from "../../lib/tableUtils";

const DailyArticleStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/fetchDailyTotals?date=${todayStr}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setApiData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [todayStr]);

  const stats = useMemo(() => {
    if (!apiData) {
      return { todayArticles: 0, todayLevelStats: {}, yesterdayArticles: 0, yesterdayLevelStats: {}, todaySelfArticleRatio: 0, yesterdaySelfArticleRatio: 0, todaySelfArticles: 0 };
    }
    const { todayArticles, todayLevelStats = {}, yesterdayArticles, yesterdayLevelStats = {} } = apiData;
    const todaySelfArticles = Number(todayLevelStats["1"]) || 0;
    const todaySelfArticleRatio = todayArticles ? Math.round((todaySelfArticles / todayArticles) * 100) : 0;
    const yesterdaySelfArticleRatio = yesterdayArticles ? Math.round(((Number(yesterdayLevelStats["1"]) || 0) / yesterdayArticles) * 100) : 0;
    return { todayArticles, todayLevelStats, yesterdayArticles, yesterdayLevelStats, todaySelfArticleRatio, yesterdaySelfArticleRatio, todaySelfArticles };
  }, [apiData]);

  const getYesterdayDate=()=>{const y=new Date(); y.setDate(y.getDate()-1); const yy=String(y.getFullYear()).slice(-2); const mm=String(y.getMonth()+1).padStart(2,'0'); const dd=String(y.getDate()).padStart(2,'0'); const days=['일','월','화','수','목','금','토']; return `${yy}-${mm}-${dd} (${days[y.getDay()]})`;};
  const renderLevelStats=(levelStats)=>{
    const levels=Object.keys(levelStats||{}).sort(); if(!levels.length) return <span>기사 없음</span>;
    let self=0, non=0; levels.forEach(l=>{if(l==='1') self+=levelStats[l]; else non+=levelStats[l];});
    return (
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {self>0 && <span className={getLevelClass('1')}>자체: {self}개</span>}
        {non>0 && <span className={getLevelClass('5')}>비자체: {non}개</span>}
      </div>
    );
  };

  if (loading) return <div className={styles.card}><div className={styles.cardContent}>데이터를 불러오는 중...</div></div>;
  if (error) return <div className={styles.card}><div className={styles.cardContent}>에러: {error}</div></div>;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>기획기사 통계</div>
          <div className={styles.cardDesc}><span style={{color:'#2563eb',fontWeight:600}}>등급1 : 자체</span>, <span style={{color:'#374151',fontWeight:600}}>나머지 등급 : 비자체</span></div>
        </div>
        <button className={styles.tabBtn} onClick={()=>window.location.reload()}>새로고침</button>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.grid+" "+styles.grid3}>
          <div className={styles.subCard}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>📰 오늘 기사</div>
                <div className={styles.cardDesc}><span style={{color:'#000'}}>{new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric'})}</span> 출고 현황</div>
              </div>
            </div>
            <div className={styles.cardContentGrow}>
              <div className={`${styles.statValue} ${styles.statEmph}`} style={{color:'#2563eb'}}>{stats.todayArticles}개</div>
              <div className={styles.statBox}>
                <div className={styles.statTitle}>등급별 분포</div>
                <div>{renderLevelStats(stats.todayLevelStats)}</div>
              </div>
            </div>
          </div>
          <div className={styles.subCard}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>📊 오늘의 기획기사 비율</div>
                <div className={styles.cardDesc}>오늘 전체 출고 기사 중 기획기사 비율</div>
              </div>
            </div>
            <div className={styles.cardContentGrow}>
              <div className={`${styles.statValue} ${styles.statEmph}`} style={{color: stats.todaySelfArticleRatio>=35? '#16a34a':'#dc2626'}}>{stats.todaySelfArticleRatio}%</div>
              <div className={styles.statBox}>
                <div className={styles.statTitle}>오늘 기사 비율 구성</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  <span className={getLevelClass('1')}>자체: {stats.todaySelfArticles}개</span>
                  <span className={styles.badge+" "+styles.badgeYellow}>전체: {stats.todayArticles}개</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.subCard}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>📅 어제 기사</div>
                <div className={styles.cardDesc}><span style={{color:'#000'}}>{getYesterdayDate()}</span> 출고 기사수와 기획기사 비율</div>
              </div>
            </div>
            <div className={styles.cardContentGrow}>
              <div style={{display:'flex',gap:24,alignItems:'center'}}>
                <div className={`${styles.statValue} ${styles.statEmph}`} style={{color:'#7c3aed'}}>총 {stats.yesterdayArticles}개</div>
                <div className={`${styles.statValue} ${styles.statEmph}`} style={{color: stats.yesterdaySelfArticleRatio>=35? '#16a34a':'#dc2626'}}>{stats.yesterdaySelfArticleRatio}%</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statTitle}>등급별 분포</div>
                <div>{renderLevelStats(stats.yesterdayLevelStats)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyArticleStats;
