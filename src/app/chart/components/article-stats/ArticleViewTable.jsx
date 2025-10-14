"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { formatLevel, getLevelClass } from "../../lib/tableUtils";
import { arrayToCSV, downloadCSV, generateFilenameWithDateRange } from "../../lib/csvUtils";

const COLUMNS=[
  {label:'출고일', key:'newsdate'},
  {label:'제목', key:'newstitle'},
  {label:'부서', key:'code_name'},
  {label:'작성자', key:'writers'},
  {label:'조회수', key:'ref'},
  {label:'등급', key:'level'},
];

export default function ArticleViewTable({ newsData }){
  const { handleSort, sortData } = useTableSort('ref','desc');
  const [mobileSortKey,setMobileSortKey]=useState('ref');
  const [mobileSortOrder,setMobileSortOrder]=useState('desc');
  const [query,setQuery]=useState('');
  const [dateRange,setDateRange]=useState({
    from:new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to:new Date()
  });
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const rows=useMemo(()=>{
    if(!newsData?.length) return [];
    return newsData.map(a=>({
      ...a,
      writers: a.byline_gijaname||'무기명',
      newsdate: new Date(a.newsdate).toISOString().split('T')[0],
      ref: Number(a.ref)||0,
      level: a.level,
    }));
  },[newsData]);

  const dateFiltered=useMemo(()=>{
    if(!dateRange?.from || !dateRange?.to) return rows;
    const fromTime=Math.min(dateRange.from.getTime(), dateRange.to.getTime());
    const toTime=Math.max(dateRange.from.getTime(), dateRange.to.getTime());
    return rows.filter(r=>{
      const t=new Date(r.newsdate).getTime();
      return t>=fromTime && t<=toTime;
    });
  },[rows,dateRange]);

  const filtered=useMemo(()=> dateFiltered.filter(r=> (r.newstitle||'').includes(query)),[dateFiltered,query]);
  const sorted=useMemo(()=> sortData(filtered),[filtered,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage) || 1;
  const paginated=useMemo(()=>{
    const start=(currentPage-1)*itemsPerPage;
    return sorted.slice(start, start+itemsPerPage);
  },[sorted,currentPage]);

  // Reset to first page when filters change
  React.useEffect(()=>{ setCurrentPage(1); },[query,dateRange]);

  // CSV 다운로드 함수
  const handleDownloadCSV = () => {
    const csvData = sorted.map(row => ({
      ...row,
      newsdate: new Date(row.newsdate).toLocaleDateString('ko-KR'),
      ref: row.ref.toLocaleString(),
      level: formatLevel(row.level),
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
            <input 
              className={styles.select} 
              placeholder="기사 제목 검색" 
              value={query} 
              onChange={e=>setQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>
      {/* 모바일 정렬 바 */}
      <div className={styles.mobileSortBar}>
        <div className={styles.mobileSortGroup}>
          <label className={styles.mobileSortLabel} htmlFor="articleMobileSort">정렬</label>
          <select id="articleMobileSort" className={styles.mobileSortSelect} value={mobileSortKey} onChange={e=>{setMobileSortKey(e.target.value); setMobileSortOrder('desc'); handleSort(e.target.value);}}>
            {COLUMNS.map(c=>(<option key={c.key} value={c.key}>{c.label}</option>))}
          </select>
          <button type="button" className={styles.sortDirBtn} onClick={()=>{handleSort(mobileSortKey); setMobileSortOrder(o=>o==='asc'?'desc':'asc');}}>
            {mobileSortOrder==='asc'?'▲':'▼'}
          </button>
        </div>
      </div>
      <div className={styles.cardContent}>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:12,color:'#374151',marginBottom:16}}>
          <div>전체 기사수: <b>{sorted.length.toLocaleString()}</b></div>
          <div>표시중: <b>{paginated.length}</b></div>
        </div>
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table+" "+styles.articleViewTable}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map(c=> (
                <th key={c.key} className={styles.th}><button className={styles.tabBtn} onClick={()=>handleSort(c.key)}>{c.label}</button></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r,i)=> (
              <tr key={r.seq+"-"+i} className={styles.tr}>
                <td className={styles.td} data-label="출고일">{r.newsdate}</td>
                <td
                  className={styles.td}
                  data-label="제목"
                  style={{ textAlign: 'left', maxWidth: 300 }}
                >
                  <a
                    href={`https://www.yeongnam.com/web/view.php?key=${r.newskey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {r.newstitle}
                  </a>
                </td>
                <td className={styles.td} data-label="부서">{r.code_name}</td>
                <td className={styles.td} data-label="작성자">{r.writers}</td>
                <td className={styles.td} data-label="조회수">{r.ref.toLocaleString()}</td>
                <td className={styles.td} data-label="등급"><span className={getLevelClass(r.level)}>{formatLevel(r.level)}</span></td>
              </tr>
            ))}
            {sorted.length===0 && (
              <tr><td className={styles.td} colSpan={COLUMNS.length}>조건에 맞는 기사가 없습니다.</td></tr>
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
