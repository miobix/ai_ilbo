"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { getSelfRatioClass } from "../../lib/tableUtils";

const COLUMNS=[
  { label:'부서', key:'department' },
  { label:'조회수', key:'totalViews' },
  { label:'기사수', key:'articleCount' },
  { label:'평균', key:'averageViews' },
  { label:'자체비율', key:'selfRatio' },
];

export default function DepartmentViewTable({ newsData }){
  const [dateRange,setDateRange]=useState({from:new Date(new Date().getFullYear(), new Date().getMonth(), 1), to:new Date()});
  const { handleSort, sortData } = useTableSort('averageViews','desc');
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const departments=useMemo(()=>{
    if(!newsData?.length||!dateRange?.from||!dateRange?.to) return [];
    const from=dateRange.from.getTime(); const to=dateRange.to.getTime();
    const map=new Map();
    for(const a of newsData){
      const t=new Date(a.newsdate).getTime(); if(t<from||t>to) continue;
      const dep=a.code_name||'미분류';
      const views=Number(a.ref)||0; const isSelf=String(a.level)==='1';
      const rec=map.get(dep)||{department:dep,totalViews:0,articleCount:0,level1Count:0};
      rec.totalViews+=views; rec.articleCount+=1; if(isSelf) rec.level1Count+=1; map.set(dep,rec);
    }
    return Array.from(map.values()).map(d=>({
      ...d,
      selfRatio: d.articleCount? Math.round((d.level1Count/d.articleCount)*100):0,
      averageViews: d.articleCount? Math.round(d.totalViews/d.articleCount):0,
    }));
  },[newsData,dateRange]);

  const sorted=useMemo(()=>sortData(departments),[departments,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage);
  const paginated=useMemo(()=>{ const s=(currentPage-1)*itemsPerPage; return sorted.slice(s,s+itemsPerPage); },[sorted,currentPage]);

  useEffect(()=>{ setCurrentPage(1); },[dateRange]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>부서별 조회수 현황</div>
          {/* 전체 통계 */}
        </div>
        <div className={styles.selectRow}>
          <input className={styles.select} type="date" value={dateRange.from.toISOString().slice(0,10)} onChange={e=>setDateRange(r=>({...r,from:new Date(e.target.value)}))} />
          <span>~</span>
          <input className={styles.select} type="date" value={dateRange.to.toISOString().slice(0,10)} onChange={e=>setDateRange(r=>({...r,to:new Date(e.target.value)}))} />
        </div>
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table+" "+styles.departmentViewTable}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map(c=> (
                <th key={c.key} className={styles.th}><button className={styles.tabBtn} onClick={()=>handleSort(c.key)}>{c.label}</button></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item,idx)=> (
              <tr key={`${item.department}-${idx}`} className={styles.tr}>
                <td className={styles.td} data-label="부서">{item.department}</td>
                <td className={styles.td} data-label="조회수">{item.totalViews.toLocaleString()}</td>
                <td className={styles.td} data-label="기사수">{item.articleCount}</td>
                <td className={styles.td} data-label="평균">{item.averageViews}</td>
                <td className={styles.td} data-label="자체비율"><span className={getSelfRatioClass(item.selfRatio)}>{item.selfRatio}%</span></td>
              </tr>
            ))}
            {paginated.length===0 && (
              <tr><td className={styles.td} colSpan={COLUMNS.length}>선택한 날짜에 해당하는 부서 데이터가 없습니다.</td></tr>
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
