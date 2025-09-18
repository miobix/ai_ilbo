"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { getSelfRatioClass } from "../../lib/tableUtils";
import { arrayToCSV, downloadCSV, generateFilenameWithDateRange } from "../../lib/csvUtils";

const COLUMNS=[
  { label:'제목', key:'title' },
  { label:'부서', key:'department' },
  { label:'조회수', key:'views' },
  { label:'자체', key:'level' },
  { label:'등록일', key:'newsdate' },
];

export default function ArticleViewTable({ newsData }){
  const [dateRange,setDateRange]=useState({from:new Date(new Date().getFullYear(), new Date().getMonth(), 1), to:new Date()});
  const { handleSort, sortData } = useTableSort('views','desc');
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;
  const [onlySelf, setOnlySelf] = useState(false);

  const articles=useMemo(()=>{
    if(!newsData?.length||!dateRange?.from||!dateRange?.to) return [];
    const from=Math.min(dateRange.from.getTime(),dateRange.to.getTime()); const to=Math.max(dateRange.from.getTime(),dateRange.to.getTime());
    return newsData
      .filter(a=>{ const t=new Date(a.newsdate).getTime(); return t>=from&&t<=to; })
      .filter(a=> onlySelf? String(a.level)==='1': true)
      .map(a=>({
        id: a.seq,
        title: a.title,
        department: a.code_name||'기타',
        views: Number(a.ref)||0,
        level: String(a.level)==='1'? '자체':'공유',
        newsdate: a.newsdate,
      }));
  },[newsData,dateRange,onlySelf]);

  const sorted=useMemo(()=>sortData(articles),[articles,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage);
  const paginated=useMemo(()=>{ const s=(currentPage-1)*itemsPerPage; return sorted.slice(s,s+itemsPerPage); },[sorted,currentPage]);

  useEffect(()=>{ setCurrentPage(1); },[dateRange,onlySelf]);

  const handleDownloadCSV = () => {
    const csvData = sorted.map(row => ({
      ...row,
      views: row.views.toLocaleString(),
    }));
    
    const csvContent = arrayToCSV(csvData, COLUMNS);
    const filename = generateFilenameWithDateRange('기사별_조회수', dateRange.from, dateRange.to);
    downloadCSV(csvContent, filename);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderImproved}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitle}>기사별 조회수</div>
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
          </div>
          <div className={styles.rightControls}>
            <label className={styles.switch}>
              <input type="checkbox" checked={onlySelf} onChange={e=>setOnlySelf(e.target.checked)} />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.switchLabel}>자체만</span>
          </div>
        </div>
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map(c=> (
                <th key={c.key} className={styles.th}><button className={styles.tabBtn} onClick={()=>handleSort(c.key)}>{c.label}</button></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item,idx)=> (
              <tr key={`${item.id}-${idx}`} className={styles.tr}>
                <td className={styles.td} data-label="제목">{item.title}</td>
                <td className={styles.td} data-label="부서">{item.department}</td>
                <td className={styles.td} data-label="조회수">{item.views.toLocaleString()}</td>
                <td className={styles.td} data-label="자체"><span className={getSelfRatioClass(item.level==='자체'?100:0)}>{item.level}</span></td>
                <td className={styles.td} data-label="등록일">{item.newsdate}</td>
              </tr>
            ))}
            {paginated.length===0 && (
              <tr><td className={styles.td} colSpan={COLUMNS.length}>선택한 조건에 해당하는 데이터가 없습니다.</td></tr>
            )}
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
