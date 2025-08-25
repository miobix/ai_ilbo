"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";

const COLUMNS=[
  {label:'출고일', key:'newsdate'},
  {label:'제목', key:'newstitle'},
  {label:'부서', key:'code_name'},
  {label:'조회수', key:'ref'},
  {label:'등급', key:'level'},
];

export default function ArticleViewTable({ newsData }){
  const { handleSort, sortData } = useTableSort('ref','desc');
  const [query,setQuery]=useState('');
  const [dateRange,setDateRange]=useState({
    from:new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to:new Date()
  });
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const rows=useMemo(()=> (newsData||[]).map(a=> ({
    ...a,
    newsdate: a.newsdate,
    ref: Number(a.ref)||0,
  })),[newsData]);

  const dateFiltered=useMemo(()=>{
    if(!rows?.length || !dateRange?.from || !dateRange?.to) return rows||[];
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

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>기사별 조회수</div>
        <div className={styles.selectRow}>
          <input
            className={styles.select}
            type="date"
            value={dateRange.from.toISOString().slice(0,10)}
            onChange={e=>setDateRange(r=>({...r,from:new Date(e.target.value)}))}
          />
          <span>~</span>
          <input
            className={styles.select}
            type="date"
            value={dateRange.to.toISOString().slice(0,10)}
            onChange={e=>setDateRange(r=>({...r,to:new Date(e.target.value)}))}
          />
          <input className={styles.select} placeholder="제목 검색" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table+" "+styles.articleViewTable}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map(c=> (<th key={c.key} className={styles.th}><button className={styles.tabBtn} onClick={()=>handleSort(c.key)}>{c.label}</button></th>))}
            </tr>
          </thead>
          <tbody>
      {paginated.map((a,i)=> (
              <tr key={a.newskey||i} className={styles.tr}>
        <td className={styles.td} data-label="출고일">{new Date(a.newsdate).toLocaleDateString('ko-KR',{year:'2-digit',month:'2-digit',day:'2-digit'})}</td>
        <td className={styles.td} data-label="제목" title={a.newstitle} style={{textAlign:'left'}}>{a.newstitle}</td>
        <td className={styles.td} data-label="부서">{a.code_name||'-'}</td>
        <td className={styles.td} data-label="조회수">{a.ref.toLocaleString()}</td>
        <td className={styles.td} data-label="등급">{a.level}</td>
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
