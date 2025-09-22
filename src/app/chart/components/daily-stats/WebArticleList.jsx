"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { truncateText, formatLevel, getLevelClass } from "../../lib/tableUtils";
import { idToName } from "../../data/userMapping";
import { getCategoryName } from "../../data/categoryMapping";
import HighlightedTextModal from "../HighlightedTextModal";

// 교열 컬럼은 test 전용으로 유지, 프로덕션에서는 제외
const columns = ["순번", "출고일시", "제목", "작성자", "부서", "등급", "등록일시", "등록자ID", "분류"];

export default function WebArticleList({ webArticleData }) {
  const [selectedDatetime, setSelectedDatetime] = useState("yesterday");
  const { sortData, handleSort } = useTableSort("newsdate", "desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalItem, setModalItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // 모바일 정렬 전용 상태 (헤더 숨김 시 사용) - 교열 제외
  const [mobileSortKey, setMobileSortKey] = useState("newsdate");
  const [mobileSortOrder, setMobileSortOrder] = useState("desc");

  const itemsPerPage = 50;

  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalItem(null);
    setShowModal(false);
  };

  // 교열 기능 제거됨 (test 전용 유지)

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

  const webArticles = useMemo(() => {
    const sel = dateGroups.find((g) => g.value === selectedDatetime);
    const list = (webArticleData || []).filter((a) => (sel ? a.newsdate && String(a.newsdate).startsWith(sel.dateStr) : true));
    // 역매핑 없이 writer_buseo가 있으면 사용, 없으면 '기타'
    return list.map((it) => ({ ...it, dept: it.writer_buseo || "기타" }));
  }, [webArticleData, selectedDatetime, dateGroups]);

  const sorted = useMemo(() => sortData(webArticles), [webArticles, sortData]);
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  // 차트는 분리된 컴포넌트(WebArticleDeptChart)로 렌더링합니다.

  // 날짜 필터 변경 시 1페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDatetime]);

  // 모바일에서 사용할 정렬 옵션 (모바일에서 숨기는 필드는 제외: 등록일시/등록자ID/분류 제외)
  const mobileSortOptions = [
    { label: "순번", key: "index" },
    { label: "출고일시", key: "newsdate" },
    { label: "제목", key: "newstitle" },
    { label: "작성자", key: "writers" },
    { label: "부서", key: "dept" },
    { label: "등급", key: "level" },
  ];

  const onChangeMobileSortKey = (e) => {
    const k = e.target.value;
    setMobileSortKey(k);
    // 새로운 키 선택 시 기본 정렬 방향(desc)로 초기화한다고 가정
    setMobileSortOrder("desc");
    handleSort(k); // 훅 내부에서 동일 키 재클릭 시 토글되는 방식이므로 첫 호출은 desc 기준 유지
  };

  const onToggleMobileSortOrder = () => {
    // 동일 키로 다시 handleSort 호출하여 asc/desc 토글
    handleSort(mobileSortKey);
    setMobileSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <>
      {/* 하단 카드: 웹출고 기사 목록 */}
      <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>웹출고 기사 목록</div>
          <div className={styles.cardDesc}>붉은색 기사는 엠바고 기사입니다.</div>
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
      {/* 모바일 전용 정렬 바 (768px 이하에서만 노출) */}
      <div className={styles.mobileSortBar}>
        <div className={styles.mobileSortGroup}>
          <label className={styles.mobileSortLabel} htmlFor="mobileSortSelect">정렬</label>
          <select
            id="mobileSortSelect"
            className={styles.mobileSortSelect}
            value={mobileSortKey}
            onChange={onChangeMobileSortKey}
          >
            {mobileSortOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <button type="button" className={styles.sortDirBtn} onClick={onToggleMobileSortOrder} aria-label="정렬 방향 토글">
            {mobileSortOrder === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>
      <div className={styles.cardContent + " " + styles.tableWrap}>
        <table className={styles.table + " " + styles.webArticleTable}>
          <thead>
            <tr className={styles.tr}>
        {columns.map((c, idx) => (
                <th key={idx} className={styles.th}>
          <button className={styles.tabBtn} onClick={() => handleSort(["index", "newsdate", "newstitle", "writers", "dept", "level", "reg_dt", "reg_id", "art_org_class"][idx])}>
                    {c}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, idx) => (
              <tr key={item.newskey || item._id || idx} className={styles.tr}>
                <td className={styles.td} data-label="순번">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className={styles.td} data-label="출고일시">
                  {item.newsdate ? new Date(item.newsdate).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }) : "-"}
                </td>
                <td className={styles.td} data-label="제목" style={{ maxWidth: 360, color: item.embargo_type === "1" ? "#dc2626" : undefined }} title={item.newstitle}>
                  {item.newstitle || "-"}
                </td>
                {/* 교열 컬럼 제거됨 */}

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
                        const regDateStr = String(item.reg_dt).split("T")[0];
                        const isSel = sel && regDateStr === sel.dateStr;
                        return (
                          <>
                            {!isSel && (
                              <div style={{ color: "#6b7280" }}>{new Date(item.reg_dt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" })}</div>
                            )}
                            <div>{new Date(item.reg_dt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" })}</div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={styles.td} data-label="등록자" title={item.reg_id}>
                  {idToName[item.reg_id] || item.reg_id || "-"}
                </td>
                <td className={styles.td} data-label="분류" title={item.art_org_class}>
                  {getCategoryName(item.art_org_class)}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={columns.length}>
                  웹출고 기사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
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
            <h3 style={{marginRight: '25px'}}>{modalItem.newstitle}</h3>
            
                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', marginTop: '20px',  maxHeight: 'calc(60vh - 120px)', // Account for title, padding, and button
  overflowY: 'auto' }}>
        <HighlightedTextModal text={modalItem.html_text} spellings={modalItem.spellings} />
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
