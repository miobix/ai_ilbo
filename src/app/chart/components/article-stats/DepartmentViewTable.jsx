"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { getSelfRatioClass } from "../../lib/tableUtils";
import { arrayToCSV, downloadCSV, generateFilenameWithDateRange } from "../../lib/csvUtils";

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
    const m=new Map(); const from=Math.min(dateRange.from.getTime(),dateRange.to.getTime()); const to=Math.max(dateRange.from.getTime(),dateRange.to.getTime());
    for(const a of newsData){
      const t=new Date(a.newsdate).getTime(); if(t<from||t>to) continue;
      const name=a.code_name||'기타'; const ref=Number(a.ref)||0; const isSelf=String(a.level)==='1';
      const rec=m.get(name)||{department:name,totalViews:0,articleCount:0,level1:0};
      rec.totalViews+=ref; rec.articleCount+=1; if(isSelf) rec.level1+=1; m.set(name,rec);
    }
    return Array.from(m.values()).map(r=>({
      ...r,
      selfRatio: r.articleCount? Math.round((r.level1/r.articleCount)*100):0,
      averageViews: r.articleCount? Math.round(r.totalViews/r.articleCount):0,
    }));
  },[newsData,dateRange]);

  const sorted=useMemo(()=>sortData(departments),[departments,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage);
  const paginated=useMemo(()=>{ const s=(currentPage-1)*itemsPerPage; return sorted.slice(s,s+itemsPerPage); },[sorted,currentPage]);

  useEffect(()=>{ setCurrentPage(1); },[dateRange]);

  // CSV 다운로드 함수
  const handleDownloadCSV = () => {
    const csvData = sorted.map(row => ({
      ...row,
      selfRatio: `${row.selfRatio}%`, // 퍼센트 기호 추가
      totalViews: row.totalViews.toLocaleString(),
      averageViews: row.averageViews.toLocaleString(),
    }));
    
    const csvContent = arrayToCSV(csvData, COLUMNS);
    const filename = generateFilenameWithDateRange('부서별_조회수', dateRange.from, dateRange.to);
    downloadCSV(csvContent, filename);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderImproved}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitle}>부서별 조회수 현황</div>
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
