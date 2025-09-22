"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

// API 기반 부서별 막대 차트: 날짜 셀렉터로 오늘/어제 호출
export default function WebArticleDeptChart() {
  const [selectedDatetime, setSelectedDatetime] = useState("yesterday");
  const [items, setItems] = useState([]);
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

  const selectedDateStr = useMemo(() => {
    const sel = dateGroups.find((g) => g.value === selectedDatetime);
    const d = sel?.baseDate || new Date();
    return d.toISOString().split('T')[0];
  }, [dateGroups, selectedDatetime]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/fetchDailyByDepartment?date=${selectedDateStr}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!ignore) setError(e.message || '데이터 로드 실패');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [selectedDateStr]);

  const deptData = useMemo(() => {
    // API는 이미 { name, count, self, nonSelf, ratio } 구조 제공
    return (items || []).slice().sort((a,b)=> b.count - a.count);
  }, [items]);

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
