"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { truncateText, formatLevel, getLevelClass } from "../../lib/tableUtils";
import { idToName } from "../../data/userMapping";
import { getCategoryName } from "../../data/categoryMapping";
import HighlightedTextModal from "../HighlightedTextModal";

const columns = ["순번", "출고일시", "제목", "교열", "작성자", "부서", "등급", "등록일시", "등록자ID", "분류"];

export default function WebArticleList() {
  const [selectedDatetime, setSelectedDatetime] = useState("yesterday");
  const { sortData, handleSort } = useTableSort("newsdate", "desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalItem, setModalItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState(null);

  const pageSize = 100; // API page_size

  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalItem(null);
    setShowModal(false);
  };

  const spellingCacheRef = React.useRef(new Map());
  const [loadingSpellingNid, setLoadingSpellingNid] = useState(null);
  const fetchSpellingDetails = async (nid) => {
    if (!nid) return { html_text: '', spellings: [] };
    if (spellingCacheRef.current.has(nid)) return spellingCacheRef.current.get(nid);
    try {
      setLoadingSpellingNid(nid);
      const res = await fetch(`/api/fetchSpellingDetails?nid=${nid}`);
      if (!res.ok) throw new Error('Failed to fetch spelling details');
      const data = await res.json();
      const shaped = { html_text: data.html_text || '', spellings: Array.isArray(data.spellings)? data.spellings: [] };
      spellingCacheRef.current.set(nid, shaped);
      return shaped;
    } catch (e) {
      console.error(e);
      return { html_text: '', spellings: [] };
    } finally { setLoadingSpellingNid(null); }
  };

  const dateGroups = useMemo(() => {
    const t = new Date();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const ts = t.toISOString().split("T")[0];
    const ys = y.toISOString().split("T")[0];
    return [
      { value: "today", label: `오늘 (${t.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})`, dateStr: ts },
      { value: "yesterday", label: `어제 (${y.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})`, dateStr: ys },
    ];
  }, []);

  const selectedDateStr = useMemo(() => {
    const sel = dateGroups.find((g) => g.value === selectedDatetime);
    return sel?.dateStr || new Date().toISOString().split('T')[0];
  }, [selectedDatetime, dateGroups]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setArticles([]);
        setMeta(null);
        const res = await fetch(`/api/fetchDailyWebList?date=${selectedDateStr}&page=1&page_size=${pageSize}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) {
          setArticles(Array.isArray(data?.items) ? data.items : []);
          setMeta(data?.meta || null);
          setCurrentPage(1);
        }
      } catch (e) {
        if (!ignore) setError(e.message || '데이터 로드 실패');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [selectedDateStr]);

  const webArticles = useMemo(() => {
    return (articles || []).map(it => ({ ...it, dept: it.dept || it.writer_buseo || '기타' }));
  }, [articles]);

  // 출고일시(뉴스 publish) = newsdate, 등록일시 = reg_dt
  const formatNewsTime = (item) => {
    const raw = item?.newsdate;
    if(!raw) return '-';
    const d = new Date(raw);
    if(isNaN(d.getTime())) return '-';
    // newsdate 가 자정(00:00)만 오는 경우 시간 표시 대신 날짜만 노출
    const hours = d.getHours();
    const minutes = d.getMinutes();
    if(hours === 0 && minutes === 0) {
      return d.toLocaleDateString('ko-KR', { month:'2-digit', day:'2-digit'}); // MM.DD
    }
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Seoul' });
  };

  const sorted = useMemo(() => sortData(webArticles), [webArticles, sortData]);
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  // 날짜 필터 변경 시 1페이지로 리셋
  // selectedDatetime 변경 시 fetch 로직에서 currentPage 리셋 처리됨

  return (
    <>
      {/* 하단 카드: 웹출고 기사 목록 */}
      <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>웹출고 기사 목록</div>
          <div className={styles.cardDesc}>붉은색 기사는 엠바고 기사입니다.</div>
          {meta && (
            <div className={styles.cardDesc} style={{marginTop:4}}>총 {meta.total_articles}건</div>
          )}
        </div>
        <div className={styles.selectRow}>
          <select className={styles.select} value={selectedDatetime} onChange={(e) => setSelectedDatetime(e.target.value)}>
            {dateGroups.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.cardContent + " " + styles.tableWrap}>
        <table className={styles.table + " " + styles.webArticleTable}>
          <thead>
            <tr className={styles.tr}>
        {columns.map((c, idx) => (
                <th key={idx} className={styles.th}>
          <button className={styles.tabBtn} onClick={() => handleSort(["index", "newsdate", "newstitle", "spellErrorCount", "writers", "dept", "level", "reg_dt", "reg_id", "art_org_class"][idx])}>
                    {c}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className={styles.td} colSpan={columns.length}>불러오는 중...</td></tr>
            )}
            {error && !loading && (
              <tr><td className={styles.td} colSpan={columns.length} style={{color:'#b91c1c'}}>에러: {error}</td></tr>
            )}
            {!loading && !error && paginated.map((item, idx) => (
              <tr key={item.newskey || item._id || idx} className={styles.tr}>
                <td className={styles.td} data-label="순번">
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className={styles.td} data-label="출고일시">{formatNewsTime(item)}</td>
                <td className={styles.td} data-label="제목" style={{ maxWidth: 360, color: item.embargo_type === "1" ? "#dc2626" : undefined }} title={item.newstitle}>
                  <Link 
                    href={`https://www.yeongnam.com/web/view.php?key=${item.newskey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      textDecoration: "none", 
                      color: "inherit",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => e.target.style.textDecoration = "underline"}
                    onMouseOut={(e) => e.target.style.textDecoration = "none"}
                  >
                    {item.newstitle || "-"}
                  </Link>
                </td>
                <td className={styles.td} data-label="교열">
                  {(() => {
                    const count = Array.isArray(item.spellings) ? item.spellings.length : (typeof item.spellErrorCount === 'number' ? item.spellErrorCount : (isNaN(Number(item.spellings)) ? null : Number(item.spellings)));
                    if (count == null) return '-';
                    return (
                      <span
                        className={`${styles.badge} ${styles.badgeMispell}`}
                        onClick={async () => {
                          const detail = await fetchSpellingDetails(item.newskey || item.nid || item.news_id);
                          openModal({ ...item, ...detail });
                        }}
                        style={{ position: 'relative' }}
                      >
                        {loadingSpellingNid === (item.newskey || item.nid) && (
                          <span style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%, -50%)',fontSize:10}}>⏳</span>
                        )}
                        {count}
                      </span>
                    );
                  })()}
                </td>
                <td className={styles.td} data-label="작성자" title={item.writers}>
                  {item.writers ? truncateText(item.writers, 10) : "-"}
                </td>
                <td className={styles.td} data-label="부서" title={item.dept}>
                  {item.dept || "-"}
                </td>
                <td className={styles.td} data-label="등급">
                  <span className={getLevelClass(item.level)}>{formatLevel(item.level)}</span>
                </td>
                <td className={styles.td} data-label="등록일시">
                  {item.reg_dt ? (
                    <div>
                      {(() => {
                        const sel = dateGroups.find((g) => g.value === selectedDatetime);
                        const regDateStr = String(item.reg_dt).split('T')[0];
                        const isSel = sel && regDateStr === sel.dateStr;
                        const d = new Date(item.reg_dt);
                        return (
                          <>
                            {!isSel && (
                              <div style={{ color: '#6b7280' }}>{d.toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', timeZone:'Asia/Seoul' })}</div>
                            )}
                            <div>{d.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Seoul' })}</div>
                          </>
                        );
                      })()}
                    </div>
                  ) : '-'}
                </td>
                <td className={styles.td} data-label="등록자" title={item.reg_id}>
                  {idToName[item.reg_id] || item.reg_id || "-"}
                </td>
                <td className={styles.td} data-label="분류" title={item.art_org_class}>
                  {getCategoryName(item.art_org_class)}
                </td>
              </tr>
            ))}
    {!loading && !error && sorted.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={columns.length}>
                  웹출고 기사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  {totalPages > 1 && !loading && !error && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", padding: "12px" }}>
          <button className={styles.select} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            이전
          </button>
          <span style={{ fontSize: 12 }}>
            {currentPage} / {totalPages} 페이지
          </span>
          <button className={styles.select} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
            다음
          </button>
        </div>
      )}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={closeModal} 
        >
          <div
          data-modal-content
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              minWidth: '350px',
              maxWidth: '80vw',
              position: 'relative',
              minHeight: '250px',
              maxHeight: '60vh',
              
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()} // prevent modal click from closing
          >
            <h3 style={{marginRight: '25px'}}>{modalItem?.newstitle}</h3>
            
                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', marginTop: '20px',  maxHeight: 'calc(60vh - 120px)', // Account for title, padding, and button
  overflowY: 'auto' }}>
        <HighlightedTextModal text={modalItem?.html_text} spellings={modalItem?.spellings} />
      </div>

             <button
        onClick={closeModal}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '28px',
          height: '28px',
          border: 'none',
          borderRadius: '50%',
          backgroundColor: '#d87a7a', 
          color: '#f7f7f7',           
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px',
          lineHeight: 1
        }}
      >
        ×
      </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
