"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

// 독립형 부서별 막대 차트: props.items가 없으면 API에서 직접 로드하고, 날짜 셀렉터로 오늘/어제 필터링
export default function WebArticleDeptChart({ items }) {
  const [selectedDatetime, setSelectedDatetime] = useState("yesterday");
  const [fetched, setFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dateGroups = useMemo(() => {
    const t = new Date();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return [
      { value: "today", label: `오늘 (${t.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})`, baseDate: t },
      { value: "yesterday", label: `어제 (${y.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })})`, baseDate: y },
    ];
  }, []);

  useEffect(() => {
    let ignore = false;
    if (items && items.length) return; // 부모에서 데이터를 주면 fetch 생략
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/fetchWMSArticles");
        if (res.status === 204) { if (!ignore) setFetched([]); return; }
        if (!res.ok) throw new Error("API 실패");
        const data = await res.json();
        if (!ignore) setFetched(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        if (!ignore) setError(e?.message || "데이터를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [items]);

  const baseList = useMemo(() => (items && items.length ? items : fetched), [items, fetched]);

  const filtered = useMemo(() => {
    const sel = dateGroups.find((g) => g.value === selectedDatetime);
    let start, end;
    if (sel?.baseDate) {
      const d = sel.baseDate;
      // UTC 경계 기준으로 하루 범위 계산 (API가 UTC 기반일 가능성 반영)
      start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
    }
    const list = (baseList || []).filter((a) => {
      if (!start || !end) return true;
      const dt = a?.newsdate ? new Date(a.newsdate) : null;
      return dt && dt.getTime() >= start.getTime() && dt.getTime() <= end.getTime();
    });
    return list.map((it) => {
      // 부서명 정규화: writer_buseo가 "부서1, 부서2" 형태면 첫 번째만 사용, 공백 트림
      const raw = typeof it?.writer_buseo === 'string' ? it.writer_buseo : (typeof it?.dept === 'string' ? it.dept : '');
      const primary = raw ? raw.split(',')[0].trim() : '';
      const dept = primary || '기타';
      return { ...it, dept };
    });
  }, [baseList, selectedDatetime, dateGroups]);

  const deptData = useMemo(() => {
    const m = new Map(); // dept -> { total, self, nonSelf }
    for (const it of filtered || []) {
      const dept = it?.dept || "기타";
      const lvl = it?.level;
      const isSelf = String(lvl) === "1" || Number(lvl) === 1; // 자체
      if (!m.has(dept)) m.set(dept, { total: 0, self: 0, nonSelf: 0 });
      const v = m.get(dept);
      v.total += 1;
      if (isSelf) v.self += 1; else v.nonSelf += 1;
    }
    const rows = Array.from(m, ([name, v]) => {
      const ratio = v.total ? Math.round((v.self / v.total) * 100) : 0; // 자체 비율 %
      return { name, count: v.total, self: v.self, nonSelf: v.nonSelf, ratio };
    }).sort((a, b) => b.count - a.count);
    return rows;
  }, [filtered]);

  const getBarColor = (ratio) => (ratio >= 35 ? '#34d399' : ratio >= 25 ? '#fcd34d' : '#f87171');

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>부서별 웹출고 현황</div>
          <div className={styles.cardDesc}>현재 선택된 날짜 기준으로 집계합니다.</div>
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
      <div className={styles.cardContent}>
        {loading && (
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>데이터를 불러오는 중...</div>
        )}
        {error && (
          <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 8 }}>로딩 실패: {error}</div>
        )}
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ left: 0, right: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={4} interval="preserveStartEnd" tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tickMargin={4} tickCount={4} tick={{ fontSize: 10 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:6, padding:'8px 10px', boxShadow:'0 2px 6px rgba(0,0,0,.08)', fontSize:12 }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
                      <div>전체: {d.count}건</div>
                      <div>자체: {d.self}건</div>
                      <div>비자체: {d.nonSelf}건</div>
                      <div style={{ marginTop:4, color:'#6b7280' }}>자체비율: {d.ratio}%</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fillOpacity={0.9}>
                {deptData.map((d) => (
                  <Cell key={d.name} fill={getBarColor(d.ratio)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {(!loading && !error && deptData.length === 0) && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>표시할 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
