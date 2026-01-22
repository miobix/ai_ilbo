"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { useTableSort } from "../../hooks/useTable";
import { toDateInputValue } from "../../lib/dateUtils";
import { getSelfRatioClass } from "../../lib/tableUtils";
import { arrayToCSV, downloadCSV, generateFilenameWithDateRange } from "../../lib/csvUtils";

const ALL_COLUMNS = [
  { label: "기자", key: "reporter" },
  { label: '네이버', key: 'ref_naver' },
  { label: '다음', key: 'ref_daum' },
  { label: '기타', key: 'ref_etc' },
  { label: '구글', key: 'ref_google' },
  { label: '모바일', key: 'ref_mobile' },
  { label: '웹', key: 'ref_web' },
  { label: "총 조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
  { label: "기획비율", key: "selfRatio" },
];

const SELF_COLUMNS = [
  { label: "기자", key: "reporter" },
  { label: '네이버', key: 'ref_naver' },
  { label: '다음', key: 'ref_daum' },
  { label: '기타', key: 'ref_etc' },
  { label: '구글', key: 'ref_google' },
  { label: '모바일', key: 'ref_mobile' },
  { label: '웹', key: 'ref_web' },
  { label: "총 조회수(기획)", key: "totalViews" },
  { label: "기획기사 수", key: "selfArticleCount" },
  { label: "평균 (기획)", key: "selfAverageViews" },
  { label: "기획비율", key: "selfRatio" },
];

export default function PersonalViewTable({ newsData }) {
  const { handleSort, sortData } = useTableSort("totalViews", "desc");
  const [mobileSortKey, setMobileSortKey] = useState("totalViews");
  const [mobileSortOrder, setMobileSortOrder] = useState("desc");
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [showSelfOnly, setShowSelfOnly] = useState(true); // 기획기사만 보기 여부
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const rows = useMemo(() => {
    const m = new Map();
    if (!newsData?.length || !dateRange?.from || !dateRange?.to) return [];
    const fromTime = Math.min(dateRange.from.getTime(), dateRange.to.getTime());
    const toTime = Math.max(dateRange.from.getTime(), dateRange.to.getTime());

    // 먼저 모든 데이터를 처리해서 원래 기획비율을 계산
    for (const a of newsData) {
      const t = new Date(a.newsdate).getTime();
      if (!(t >= fromTime && t <= toTime)) continue;

      const name = a.byline_gijaname || "무기명";
      const ref = Number(a.ref) || 0;
      const isSelf = String(a.level) === "1";

      const rec = m.get(name) || {
        reporter: name,
        totalViews: 0,
        articleCount: 0,
        level1: 0,
        selfViews: 0,
        originalTotalViews: 0,
        originalArticleCount: 0,
        ref_naver: 0,
        ref_daum: 0,
        ref_etc: 0,
        ref_google: 0,
        ref_mobile: 0,
        ref_web: 0,
      };

      // 원래 데이터는 항상 누적
      rec.originalTotalViews += ref;
      rec.originalArticleCount += 1;

      // 기획기사만 보기 모드가 아니거나, 기획기사인 경우에만 현재 표시용 데이터에 누적
      if (!showSelfOnly || isSelf) {
        rec.totalViews += ref;
        rec.articleCount += 1;

        rec.ref_naver += Number(a.ref_naver) || 0;
        rec.ref_daum += (Number(a.ref_daum) || 0) + (Number(a.external_daum) || 0);
        rec.ref_etc += Number(a.ref_etc) || 0;
        rec.ref_google += Number(a.ref_google) || 0;
        rec.ref_mobile += Number(a.ref_mobile) || 0;
        rec.ref_web += Number(a.ref_web) || 0;
      }

      if (isSelf) {
        rec.level1 += 1;
        rec.selfViews += ref;
      }



      m.set(name, rec);
    }

    return Array.from(m.values())
      .filter((r) => (showSelfOnly ? r.level1 > 0 : true)) // 기획기사만 보기 모드에서는 기획기사가 있는 기자만
      .map((r) => ({
        ...r,
        selfRatio: r.originalArticleCount ? Math.round((r.level1 / r.originalArticleCount) * 100) : 0, // 항상 원래 비율 사용
        averageViews: r.articleCount ? Math.round(r.totalViews / r.articleCount) : 0,
        selfArticleCount: r.level1,
        selfAverageViews: r.level1 ? Math.round(r.selfViews / r.level1) : 0,
      }));
  }, [newsData, dateRange, showSelfOnly]);

  const filtered = useMemo(() => rows.filter((r) => r.reporter.includes(query)), [rows, query]);
  const sorted = useMemo(() => sortData(filtered), [filtered, sortData]);
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, dateRange, showSelfOnly]);

  const COLUMNS = showSelfOnly ? SELF_COLUMNS : ALL_COLUMNS;

  // CSV 다운로드 함수
  const handleDownloadCSV = () => {
    const csvData = sorted.map((row) => ({
      ...row,
      selfRatio: `${row.selfRatio}%`, // 퍼센트 기호 추가
      totalViews: row.totalViews.toLocaleString(),
      averageViews: row.averageViews.toLocaleString(),
      selfAverageViews: row.selfAverageViews.toLocaleString(),
    }));

    const csvContent = arrayToCSV(csvData, COLUMNS);
    const filename = generateFilenameWithDateRange(showSelfOnly ? "기자별_기획기사_조회수" : "기자별_조회수", dateRange.from, dateRange.to);
    downloadCSV(csvContent, filename);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeaderImproved}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitle}>기자별 조회수</div>
          <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={handleDownloadCSV}>
            📥 CSV 다운로드
          </button>
        </div>
        <div className={styles.controlsRow}>
          <div className={styles.leftControls}>
            <input className={styles.select} type="date" value={toDateInputValue(dateRange.from)} onChange={(e) => setDateRange((r) => ({ ...r, from: new Date(e.target.value) }))} />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>~</span>
            <input className={styles.select} type="date" value={toDateInputValue(dateRange.to)} onChange={(e) => setDateRange((r) => ({ ...r, to: new Date(e.target.value) }))} />
            <input className={styles.select} placeholder="기자 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className={styles.rightControls}>
            <button className={`${styles.actionBtn} ${styles.actionBtnToggle} ${showSelfOnly ? styles.active : ""}`} onClick={() => setShowSelfOnly(!showSelfOnly)}>
              {showSelfOnly ? "📰 전체보기" : "✏️ 기획기사만"}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.mobileSortBar}>
        <div className={styles.mobileSortGroup}>
          <label className={styles.mobileSortLabel} htmlFor="personalMobileSort">
            정렬
          </label>
          <select
            id="personalMobileSort"
            className={styles.mobileSortSelect}
            value={mobileSortKey}
            onChange={(e) => {
              setMobileSortKey(e.target.value);
              setMobileSortOrder("desc");
              handleSort(e.target.value);
            }}
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.sortDirBtn}
            onClick={() => {
              handleSort(mobileSortKey);
              setMobileSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            }}
          >
            {mobileSortOrder === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>
      {/* 요약 합계 */}
      <div className={styles.cardContent}>
        {sorted.length > 0 ? (
          (() => {
            const tot = sorted.reduce(
              (acc, r) => {
                acc.views += r.totalViews;
                acc.articles += r.articleCount;
                return acc;
              },
              { views: 0, articles: 0 }
            );
            const avg = tot.articles ? Math.round(tot.views / tot.articles) : 0;
            return (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#374151" }}>
                <div>
                  합계 조회수: <b>{tot.views.toLocaleString()}</b>
                </div>
                <div>
                  합계 기사수: <b>{tot.articles.toLocaleString()}</b>
                </div>
                <div>
                  전체 평균: <b>{avg.toLocaleString()}</b>
                </div>
              </div>
            );
          })()
        ) : (
          <div style={{ fontSize: 12, color: "#6b7280" }}>데이터가 없습니다.</div>
        )}
      </div>
      <div className={styles.cardContent + " " + styles.tableWrap}>
        <table className={styles.table + " " + styles.personalViewTable}>
          <thead>
            <tr className={styles.tr}>
              {COLUMNS.map((c) => (
                <th key={c.key} className={styles.th}>
                  <button className={styles.tabBtn} onClick={() => handleSort(c.key)}>
                    {c.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, i) => (
              <tr key={r.reporter + "-" + i} className={styles.tr}>
                <td className={styles.td} data-label="기자">
                  {r.reporter}
                </td>
                <td className={styles.td} data-label="네이버">{r.ref_naver?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="다음">{r.ref_daum?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="기타">{r.ref_etc?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="구글">{r.ref_google?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="모바일">{r.ref_mobile?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="웹">{r.ref_web?.toLocaleString() ?? 0}</td>
                <td className={styles.td} data-label="총 조회수">
                  {r.totalViews.toLocaleString()}
                </td>
                {showSelfOnly ? (
                  <>
                    <td className={styles.td} data-label="기획기사 수">
                      {r.selfArticleCount}
                    </td>
                    <td className={styles.td} data-label="기획기사 평균 조회수">
                      {r.selfArticleCount >= 5 ? r.selfAverageViews.toLocaleString() : ""}
                    </td>
                  </>
                ) : (
                  <>
                    <td className={styles.td} data-label="기사수">
                      {r.articleCount}
                    </td>
                    <td className={styles.td} data-label="평균">
                      {r.articleCount >= 5 ? r.averageViews.toLocaleString() : ""}
                    </td>
                  </>
                )}
                <td className={styles.td} data-label="기획비율">
                  <span className={getSelfRatioClass(r.selfRatio)}>{r.selfRatio}%</span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={COLUMNS.length}>
                  데이터가 없습니다.
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
    </div>
  );
}
