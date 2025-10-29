"use client";
import React, { useMemo } from "react";
import styles from "../../chart.module.css";
import { getLevelClass } from "../../lib/tableUtils";

const DailyArticleStats = ({ newsData }) => {
  const stats = useMemo(()=>{
    if(!newsData?.length){return{todayArticles:0,todayLevelStats:{},yesterdayArticles:0,yesterdayLevelStats:{},todaySelfArticleRatio:0,yesterdaySelfArticleRatio:0,todaySelfArticles:0,yesterdaySelfArticles:0,todayGeneralArticles:0};}
    const today=new Date(); const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
    const todayStr=today.toISOString().split('T')[0]; const yesterdayStr=yesterday.toISOString().split('T')[0];
    const todayArticles=newsData.filter(a=>a.newsdate && String(a.newsdate).startsWith(todayStr));
    const yesterdayArticles=newsData.filter(a=>a.newsdate && String(a.newsdate).startsWith(yesterdayStr));
    const calc=(arr)=>{const m={}; arr.forEach(a=>{const l=a.level||'5'; m[l]=(m[l]||0)+1;}); return m;}
    const ts=todayArticles.filter(a=>String(a.level)==='1').length;
    const tg=todayArticles.filter(a=>String(a.level)==='2').length;
    const ys=yesterdayArticles.filter(a=>String(a.level)==='1').length;
    const tr=todayArticles.length?Math.round((ts/todayArticles.length)*100):0;
    const yr=yesterdayArticles.length?Math.round((ys/yesterdayArticles.length)*100):0;
    return {todayArticles:todayArticles.length,todayLevelStats:calc(todayArticles),yesterdayArticles:yesterdayArticles.length,yesterdayLevelStats:calc(yesterdayArticles),todaySelfArticleRatio:tr,yesterdaySelfArticleRatio:yr,todaySelfArticles:ts,yesterdaySelfArticles:ys,todayGeneralArticles:tg};
  },[newsData]);

  const getYesterdayDate=()=>{const y=new Date(); y.setDate(y.getDate()-1); const yy=String(y.getFullYear()).slice(-2); const mm=String(y.getMonth()+1).padStart(2,'0'); const dd=String(y.getDate()).padStart(2,'0'); const days=['일','월','화','수','목','금','토']; return `${yy}-${mm}-${dd} (${days[y.getDay()]})`;};
  const getLastUpdateTime=()=>{if(!newsData?.length||!newsData[0].last_update) return null; const t=new Date(newsData[0].last_update); return t.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'UTC'});}

  const renderLevelStats=(levelStats)=>{
    const levels=Object.keys(levelStats||{}).sort(); if(!levels.length) return <span>기사 없음</span>;
    let self=0, non=0; levels.forEach(l=>{if(l==='1') self+=levelStats[l]; else non+=levelStats[l];});
    return (
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {self>0 && <span className={getLevelClass('1')}>기획: {self}개</span>}
        {non>0 && <span className={getLevelClass('5')}>비기획: {non}개</span>}
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>기획기사 통계</div>
          <div className={styles.cardDesc}>{getLastUpdateTime() && `최종 업데이트: ${getLastUpdateTime()}`}</div>
          <div className={styles.cardDesc}><span style={{color:'#2563eb',fontWeight:600}}>등급1 : 기획</span>, <span style={{color:'#374151',fontWeight:600}}>나머지 등급 : 비기획</span></div>
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
                  <span className={getLevelClass('1')}>기획: {stats.todaySelfArticles}개</span>
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
