"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 히스토리 -> 날짜별 일별 조회수(전일 대비 증가량) 배열
function getDailyData(article) {
  const sorted = [...(article.history || [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return sorted.map((h, i) => {
    const prev = sorted[i - 1];
    // 첫날은 기준값이 없으므로 일일 증가량에서 제외한다.
    const daily = prev ? Math.max(0, h.ref - prev.ref) : null;
    return { date: h.date.slice(5), full: h.date, daily, total: h.ref };
  });
}

function getAvg(daily) {
  const vals = daily.filter((d) => d.daily > 0);
  return vals.length
    ? Math.round(vals.reduce((s, d) => s + d.daily, 0) / vals.length)
    : 0;
}

function isSpike(daily, avg) {
  return avg > 0 && daily > avg * 2 && daily >= 5;
}

const BAR_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#374151", fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#1d4ed8" }}>
        +{(payload[0]?.value ?? 0).toLocaleString()}
      </div>
    </div>
  );
};

function ArticleCard({ article }) {
  const daily = useMemo(() => getDailyData(article), [article]);
  const avg = useMemo(() => getAvg(daily), [daily]);
  const latest = daily[daily.length - 1];
  const todaySpike = latest ? isSpike(latest.daily, avg) : false;
  const totalRef = latest?.total ?? 0;

  return (
    <div
      style={{
        border: todaySpike ? "2px solid #dc2626" : "1px solid #e5e7eb",
        borderRadius: 12,
        background: todaySpike ? "#fff8f8" : "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 14px 6px", borderBottom: "1px solid #f3f4f6" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            title={article.title}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#1d4ed8",
              textDecoration: "none",
              lineHeight: 1.4,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.title}
          </a>
          {todaySpike && (
            <span
              style={{
                background: "#dc2626",
                color: "#fff",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 10,
                fontWeight: 800,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              급증
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 6,
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          <span>
            누적{" "}
            <b style={{ color: "#111827" }}>{totalRef.toLocaleString()}</b>
          </span>
          <span>
            오늘{" "}
            <b style={{ color: todaySpike ? "#dc2626" : "#1d4ed8", fontSize: 14 }}>
              +{(latest?.daily ?? 0).toLocaleString()}
            </b>
          </span>
          <span>평균 +{avg.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ padding: "8px 4px 4px" }}>
        <ResponsiveContainer width="100%" height={110}>
          <LineChart
            data={daily}
            margin={{ top: 2, right: 6, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip content={<BAR_TOOLTIP />} />
            {avg > 0 && (
              <ReferenceLine y={avg} stroke="#d1d5db" strokeDasharray="3 3" />
            )}
            <Line
              type="linear"
              dataKey="daily"
              stroke="#2563eb"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (payload?.daily == null) return null;

                const fill = isSpike(payload.daily, avg)
                  ? "#dc2626"
                  : index === daily.length - 1
                  ? "#2563eb"
                  : "#93c5fd";

                return <circle cx={cx} cy={cy} r={2.5} fill={fill} stroke="none" />;
              }}
              activeDot={{ r: 4, fill: "#2563eb" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub, color }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "14px 16px",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div
        style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af" }}>{sub}</div>
    </div>
  );
}

export default function EnterpriseViewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("today");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/fetchEnterpriseArticleViews");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setArticles(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const enriched = useMemo(
    () =>
      articles.map((a) => {
        const daily = getDailyData(a);
        const avg = getAvg(daily);
        const latest = daily[daily.length - 1];
        const todayInc = latest?.daily ?? 0;
        const spike = isSpike(todayInc, avg);
        return { ...a, daily, avg, todayInc, spike, totalRef: latest?.total ?? 0 };
      }),
    [articles]
  );

  const latestDate = useMemo(() => {
    const all = articles.flatMap((a) => (a.history || []).map((h) => h.date));
    return all.length ? [...all].sort().reverse()[0] : null;
  }, [articles]);

  const summary = useMemo(() => {
    if (!enriched.length) return null;
    const totalToday = enriched.reduce((s, a) => s + a.todayInc, 0);
    const spikeCount = enriched.filter((a) => a.spike).length;
    const topToday = [...enriched].sort((a, b) => b.todayInc - a.todayInc)[0];
    const topTotal = [...enriched].sort((a, b) => b.totalRef - a.totalRef)[0];
    return { totalToday, spikeCount, topToday, topTotal };
  }, [enriched]);

  const sorted = useMemo(() => {
    const arr = [...enriched];
    if (sortKey === "today") arr.sort((a, b) => b.todayInc - a.todayInc);
    else if (sortKey === "total") arr.sort((a, b) => b.totalRef - a.totalRef);
    else if (sortKey === "spike")
      arr.sort(
        (a, b) => Number(b.spike) - Number(a.spike) || b.todayInc - a.todayInc
      );
    return arr;
  }, [enriched, sortKey]);

  if (loading)
    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>데이터를 불러오는 중...</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>에러: {error}</div>
      </div>
    );
  if (!articles.length)
    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>표시할 데이터가 없습니다.</div>
      </div>
    );

  return (
    <>
      {summary && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>기획기사 조회수 요약</div>
              <div className={styles.cardDesc}>
                {latestDate} 기준 · 총 {articles.length}건 모니터링 중
              </div>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              <SummaryTile
                label="오늘 총 조회수"
                value={`+${summary.totalToday.toLocaleString()}건`}
                sub="전체 기사 합산"
                color="#1d4ed8"
              />
              <SummaryTile
                label="급증 기사"
                value={`${summary.spikeCount}건`}
                sub="평균 2배 초과"
                color={summary.spikeCount > 0 ? "#dc2626" : "#6b7280"}
              />
              <SummaryTile
                label="오늘 1위"
                value={`+${summary.topToday.todayInc.toLocaleString()}건`}
                sub={
                  summary.topToday.title.length > 18
                    ? summary.topToday.title.slice(0, 18) + "…"
                    : summary.topToday.title
                }
                color="#16a34a"
              />
              <SummaryTile
                label="누적 1위"
                value={summary.topTotal.totalRef.toLocaleString()}
                sub={
                  summary.topTotal.title.length > 18
                    ? summary.topTotal.title.slice(0, 18) + "…"
                    : summary.topTotal.title
                }
                color="#7c3aed"
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>기사별 일별 조회수</div>
            <div className={styles.cardDesc}>
              막대 = 당일 조회수 · 회색점선 = 평균 · 빨강 = 평균 2배 초과 급증 의심
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>정렬</span>
            <select
              className={styles.select}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="today">오늘 조회수 순</option>
              <option value="total">누적 조회수 순</option>
              <option value="spike">급증 우선</option>
            </select>
          </div>
        </div>
        <div className={styles.cardContent}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 12,
            }}
          >
            {sorted.map((a) => (
              <ArticleCard key={a.newskey} article={a} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
