"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { getSelfRatioClass } from "../../lib/tableUtils";

const COLUMNS=[
  {label:'기자', key:'reporter'},
  {label:'조회수', key:'totalViews'},
  {label:'기사수', key:'articleCount'},
  {label:'평균', key:'averageViews'},
  {label:'자체비율', key:'selfRatio'},
];

export default function PersonalViewTable({ newsData }){
  const { handleSort, sortData } = useTableSort('averageViews','desc');
  const [query,setQuery]=useState('');
  const [dateRange,setDateRange]=useState({
    from:new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to:new Date()
  });
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const rows=useMemo(()=>{
    const m=new Map();
    if(!newsData?.length || !dateRange?.from || !dateRange?.to) return [];
    const fromTime=Math.min(dateRange.from.getTime(), dateRange.to.getTime());
    const toTime=Math.max(dateRange.from.getTime(), dateRange.to.getTime());
    for(const a of newsData){
      const t=new Date(a.newsdate).getTime();
      if(!(t>=fromTime && t<=toTime)) continue;
      const name=a.byline_gijaname || '무기명';
      const ref=Number(a.ref)||0; const isSelf=String(a.level)==='1';
      const rec=m.get(name)||{reporter:name,totalViews:0,articleCount:0,level1:0};
      rec.totalViews+=ref; rec.articleCount+=1; if(isSelf) rec.level1+=1; m.set(name,rec);
    }
    return Array.from(m.values()).map(r=>({
      ...r,
      selfRatio: r.articleCount? Math.round((r.level1/r.articleCount)*100):0,
      averageViews: r.articleCount? Math.round(r.totalViews/r.articleCount):0,
    }));
  },[newsData,dateRange]);

  const filtered=useMemo(()=> rows.filter(r=>r.reporter.includes(query)),[rows,query]);
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
        <div>
          <div className={styles.cardTitle}>기자별 조회수</div>
        </div>
        <div className={styles.selectRow}>
          <input
            className={styles.select}
            type="date"
            value={toDateInputValue(dateRange.from)}
            onChange={e=>setDateRange(r=>({...r,from:new Date(e.target.value)}))}
          />
          <span>~</span>
          <input
            className={styles.select}
            type="date"
            value={toDateInputValue(dateRange.to)}
            onChange={e=>setDateRange(r=>({...r,to:new Date(e.target.value)}))}
          />
          <input className={styles.select} placeholder="기자 검색" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
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
        <td className={styles.td} data-label="기사수">{r.articleCount}</td>
        <td className={styles.td} data-label="평균">{r.averageViews}</td>
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
