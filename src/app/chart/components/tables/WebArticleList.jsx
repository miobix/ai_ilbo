"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { truncateText, formatLevel, getLevelClass } from "../../lib/tableUtils";
import { idToName } from "../../data/userMapping";
import { getCategoryName } from "../../data/categoryMapping";

const columns=["순번","출고일시","제목","작성자","등급","등록일시","등록자ID","분류"];

export default function WebArticleList({ webArticleData }){
  const [selectedDatetime,setSelectedDatetime]=useState('today');
  const { sortData, handleSort } = useTableSort('newsdate','desc');
  const [currentPage,setCurrentPage]=useState(1);
  const itemsPerPage=50;

  const dateGroups=useMemo(()=>{
    const t=new Date(); const y=new Date(); y.setDate(y.getDate()-1);
    const ts=t.toISOString().split('T')[0]; const ys=y.toISOString().split('T')[0];
    return [
      {value:'today',label:`오늘 (${t.toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'})})`,dateStr:ts},
      {value:'yesterday',label:`어제 (${y.toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'})})`,dateStr:ys}
    ];
  },[]);

  const webArticles=useMemo(()=>{
    const sel=dateGroups.find(g=>g.value===selectedDatetime);
    const list=(webArticleData||[]).filter(a=> sel? (a.newsdate && String(a.newsdate).startsWith(sel.dateStr)) : true);
    return list;
  },[webArticleData,selectedDatetime,dateGroups]);

  const sorted=useMemo(()=>sortData(webArticles),[webArticles,sortData]);
  const totalPages=Math.ceil(sorted.length/itemsPerPage) || 1;
  const paginated=useMemo(()=>{
    const start=(currentPage-1)*itemsPerPage;
    return sorted.slice(start, start+itemsPerPage);
  },[sorted,currentPage]);

  // 날짜 필터 변경 시 1페이지로 리셋
  React.useEffect(()=>{ setCurrentPage(1); },[selectedDatetime]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>웹출고 기사 목록</div>
          <div className={styles.cardDesc}>붉은색 기사는 엠바고 기사입니다.</div>
        </div>
        <div className={styles.selectRow}>
          <select className={styles.select} value={selectedDatetime} onChange={e=>setSelectedDatetime(e.target.value)}>
            {dateGroups.map(g=> (<option key={g.value} value={g.value}>{g.label}</option>))}
          </select>
        </div>
      </div>
      <div className={styles.cardContent+" "+styles.tableWrap}>
        <table className={styles.table+" "+styles.webArticleTable}>
          <thead>
            <tr className={styles.tr}>
              {columns.map((c,idx)=> (
                <th key={idx} className={styles.th}>
                  <button className={styles.tabBtn} onClick={()=>handleSort(['index','newsdate','newstitle','writers','level','reg_dt','reg_id','art_org_class'][idx])}>{c}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
      {paginated.map((item,idx)=> (
              <tr key={item.newskey||item._id||idx} className={styles.tr}>
        <td className={styles.td} data-label="순번">{(currentPage-1)*itemsPerPage + idx + 1}</td>
        <td className={styles.td} data-label="출고일시">{item.newsdate? new Date(item.newsdate).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'UTC'}): '-'}</td>
        <td className={styles.td} data-label="제목" style={{maxWidth:360,color:item.embargo_type==='1'? '#dc2626': undefined}} title={item.newstitle}>{item.newstitle||'-'}</td>
        <td className={styles.td} data-label="작성자" title={item.writers}>{item.writers? truncateText(item.writers,10): '-'}</td>
        <td className={styles.td} data-label="등급"><span className={getLevelClass(item.level)}>{formatLevel(item.level)}</span></td>
        <td className={styles.td} data-label="등록일시">
                  {item.reg_dt? (
                    <div>
                      {(()=>{ const sel=dateGroups.find(g=>g.value===selectedDatetime); const regDateStr=String(item.reg_dt).split('T')[0]; const isSel= sel && regDateStr===sel.dateStr; return (
                        <>
                          {!isSel && <div style={{color:'#6b7280'}}>{new Date(item.reg_dt).toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'UTC'})}</div>}
                          <div>{new Date(item.reg_dt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'UTC'})}</div>
                        </>
                      ); })()}
                    </div>
                  ) : '-'}
                </td>
  <td className={styles.td} data-label="등록자" title={item.reg_id}>{idToName[item.reg_id] || item.reg_id || '-'}</td>
        <td className={styles.td} data-label="분류" title={item.art_org_class}>{getCategoryName(item.art_org_class)}</td>
              </tr>
            ))}
            {sorted.length===0 && (
              <tr><td className={styles.td} colSpan={columns.length}>웹출고 기사가 없습니다.</td></tr>
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
