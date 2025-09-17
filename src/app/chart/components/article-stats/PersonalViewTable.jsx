"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { getSelfRatioClass } from "../../lib/tableUtils";
import { arrayToCSV, downloadCSV, generateFilenameWithDateRange } from "../../lib/csvUtils";

const ALL_COLUMNS=[
  {label:'기자', key:'reporter'},
  {label:'조회수', key:'totalViews'},
  {label:'기사수', key:'articleCount'},
  {label:'평균', key:'averageViews'},
  {label:'자체비율', key:'selfRatio'},
];

const SELF_COLUMNS=[
  {label:'기자', key:'reporter'},
  {label:'자체기사 조회수', key:'totalViews'},
  {label:'자체기사 수', key:'selfArticleCount'},
  {label:'자체기사 평균 조회수', key:'selfAverageViews'},
  {label:'자체 비율', key:'selfRatio'},
];

export default function PersonalViewTable({ newsData }){
  const { handleSort, sortData } = useTableSort('averageViews','desc');
  const [query,setQuery]=useState('');
  const [dateRange,setDateRange]=useState({
    from:new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to:new Date()
  });
  const [showSelfOnly, setShowSelfOnly] = useState(false); // 자체기사만 보기 여부
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const rows=useMemo(()=>{
    const m=new Map();
    if(!newsData?.length || !dateRange?.from || !dateRange?.to) return [];
    const fromTime=Math.min(dateRange.from.getTime(), dateRange.to.getTime());
    const toTime=Math.max(dateRange.from.getTime(), dateRange.to.getTime());
    
    // 먼저 모든 데이터를 처리해서 원래 자체비율을 계산
    for(const a of newsData){
      const t=new Date(a.newsdate).getTime();
      if(!(t>=fromTime && t<=toTime)) continue;
      
      const name=a.byline_gijaname || '무기명';
      const ref=Number(a.ref)||0; 
      const isSelf=String(a.level)==='1';
      
      const rec=m.get(name)||{
        reporter:name,
        totalViews:0,
        articleCount:0,
        level1:0,
        selfViews:0,
        originalTotalViews: 0,  // 원래 총 조회수
        originalArticleCount: 0  // 원래 총 기사수
      };
      
      // 원래 데이터는 항상 누적
      rec.originalTotalViews+=ref; 
      rec.originalArticleCount+=1;
      
      // 자체기사만 보기 모드가 아니거나, 자체기사인 경우에만 현재 표시용 데이터에 누적
      if(!showSelfOnly || isSelf) {
        rec.totalViews+=ref; 
        rec.articleCount+=1;
      }
      
      if(isSelf) {
        rec.level1+=1;
        rec.selfViews+=ref;
      }
      
      m.set(name,rec);
    }
    
    return Array.from(m.values())
      .filter(r => showSelfOnly ? r.level1 > 0 : true)  // 자체기사만 보기 모드에서는 자체기사가 있는 기자만
      .map(r=>({
        ...r,
        selfRatio: r.originalArticleCount? Math.round((r.level1/r.originalArticleCount)*100):0,  // 항상 원래 비율 사용
        averageViews: r.articleCount? Math.round(r.totalViews/r.articleCount):0,
        selfArticleCount: r.level1,
        selfAverageViews: r.level1? Math.round(r.selfViews/r.level1):0,
      }));
  },[newsData,dateRange,showSelfOnly]);

  const filtered=useMemo(()=> rows.filter(r=>r.reporter.includes(query)),[rows,query]);
  const sorted=useMemo(()=> sortData(filtered),[filtered,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage) || 1;
  const paginated=useMemo(()=>{
    const start=(currentPage-1)*itemsPerPage;
    return sorted.slice(start, start+itemsPerPage);
  },[sorted,currentPage]);

  // Reset to first page when filters change
  React.useEffect(()=>{ setCurrentPage(1); },[query,dateRange,showSelfOnly]);

  const COLUMNS = showSelfOnly ? SELF_COLUMNS : ALL_COLUMNS;

  // CSV 다운로드 함수
  const handleDownloadCSV = () => {
    const csvData = sorted.map(row => ({
      ...row,
      selfRatio: `${row.selfRatio}%`, // 퍼센트 기호 추가
      totalViews: row.totalViews.toLocaleString(),
      averageViews: row.averageViews.toLocaleString(),
      selfAverageViews: row.selfAverageViews.toLocaleString(),
    }));
    
    const csvContent = arrayToCSV(csvData, COLUMNS);
    const filename = generateFilenameWithDateRange(
      showSelfOnly ? '기자별_자체기사_조회수' : '기자별_조회수',
      dateRange.from,
      dateRange.to
    );
    downloadCSV(csvContent, filename);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderImproved}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitle}>기자별 조회수</div>
          <button 
            className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
            onClick={handleDownloadCSV}
          >
            📥 CSV 다운로드
          </button>
        </div>
        <div className={styles.controlsRow}>
          <div className={styles.leftControls}>
            <input
              className={styles.select}
              type="date"
              value={toDateInputValue(dateRange.from)}
              onChange={e=>setDateRange(r=>({...r,from:new Date(e.target.value)}))}
            />
            <span style={{color: '#6b7280', fontSize: '14px'}}>~</span>
            <input
              className={styles.select}
              type="date"
              value={toDateInputValue(dateRange.to)}
              onChange={e=>setDateRange(r=>({...r,to:new Date(e.target.value)}))}
            />
            <input 
              className={styles.select} 
              placeholder="기자 검색" 
              value={query} 
              onChange={e=>setQuery(e.target.value)} 
            />
          </div>
          <div className={styles.rightControls}>
            <button 
              className={`${styles.actionBtn} ${styles.actionBtnToggle} ${showSelfOnly ? styles.active : ''}`}
              onClick={() => setShowSelfOnly(!showSelfOnly)}
            >
              {showSelfOnly ? '📰 전체보기' : '✏️ 자체기사만'}
            </button>
          </div>
        </div>
      </div>
      {/* 요약 합계 */}
      <div className={styles.cardContent}>
        {sorted.length>0 ? (
          (()=>{
            const tot = sorted.reduce((acc,r)=>{ acc.views+=r.totalViews; acc.articles+=r.articleCount; return acc; },{views:0,articles:0});
            const avg = tot.articles? Math.round(tot.views / tot.articles) : 0;
            return (
              <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:12,color:'#374151'}}>
                <div>합계 조회수: <b>{tot.views.toLocaleString()}</b></div>
                <div>합계 기사수: <b>{tot.articles.toLocaleString()}</b></div>
                <div>전체 평균: <b>{avg.toLocaleString()}</b></div>
              </div>
            );
          })()
        ) : (
          <div style={{fontSize:12,color:'#6b7280'}}>데이터가 없습니다.</div>
        )}
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table+" "+styles.personalViewTable}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map(c=> (<th key={c.key} className={styles.th}><button className={styles.tabBtn} onClick={()=>handleSort(c.key)}>{c.label}</button></th>))}
            </tr>
          </thead>
          <tbody>
      {paginated.map((r,i)=> (
              <tr key={r.reporter+"-"+i} className={styles.tr}>
        <td className={styles.td} data-label="기자">{r.reporter}</td>
        <td className={styles.td} data-label="조회수">{r.totalViews.toLocaleString()}</td>
        {showSelfOnly ? (
          <>
            <td className={styles.td} data-label="자체기사 수">{r.selfArticleCount}</td>
            <td className={styles.td} data-label="자체기사 평균 조회수">{r.selfAverageViews.toLocaleString()}</td>
          </>
        ) : (
          <>
            <td className={styles.td} data-label="기사수">{r.articleCount}</td>
            <td className={styles.td} data-label="평균">{r.averageViews.toLocaleString()}</td>
          </>
        )}
        <td className={styles.td} data-label="자체비율"><span className={getSelfRatioClass(r.selfRatio)}>{r.selfRatio}%</span></td>
              </tr>
            ))}
            {sorted.length===0 && (<tr><td className={styles.td} colSpan={COLUMNS.length}>데이터가 없습니다.</td></tr>)}
          </tbody>
        </table>
      </div>
      {totalPages>1 && (
        <div style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center',padding:'12px'}}>
          <button className={styles.select} disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>이전</button>
          <span style={{fontSize:12}}>{currentPage} / {totalPages} 페이지</span>
          <button className={styles.select} disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>다음</button>
        </div>
      )}
    </div>
  );
}
