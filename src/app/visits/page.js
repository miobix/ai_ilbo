"use client";
import Image from "next/image";
import styles from "./page.module.css";
import cstyles from "./chart.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const allGroups = ["homeDesktop", "homeMobile", "sectionDesktop", "sectionMobile", "viewDesktop", "viewMobile", "total"];
const groupLabels = {
  homeDesktop: "홈 웹",
  homeMobile: "홈 모바일",
  sectionDesktop: "섹션 웹",
  sectionMobile: "섹션 모바일",
  viewDesktop: "기사 웹",
  viewMobile: "기사 모바일",
  total: "총",
  기타: "기타",
};

function prepareChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  // Assume each array has 30 entries
  const chartData = visitsData.total.map((tEntry, i) => {
    const obj = { date: formatDateMMDD(tEntry.date) };
    let sumOthers = 0;

    allGroups.forEach((grp) => {
      const val = visitsData[grp][i]?.pageViews || 0;
      obj[grp] = val;
      if (grp !== "total") sumOthers += val;
    });

    obj["기타"] = obj.total - sumOthers;
    return obj;
  });

  return chartData;
}

function formatDateMMDD(dateStr) {
  return dateStr.slice(4, 6) + "-" + dateStr.slice(6, 8);
}

export default function Visits() {
  const [visitsData, setVisitsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    total: true,
    homeDesktop: true,
    homeMobile: true,
    sectionDesktop: false,
    sectionMobile: false,
    viewDesktop: false,
    viewMobile: false,
    기타: false,
  });
  const [period, setPeriod] = useState("월"); // default

  const periods = ["월", "1주전", "2주전", "3주전", "4주전"];

  //loaddata
  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
        console.log("Fetching visits data...");
        setIsLoading(true);
        const res = await fetch("/api/fetchHomepageVisits");
        if (res.status === 204) {
          setVisitsData({});
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVisitsData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticlesData();
  }, []);

  const chartData = prepareChartData(visitsData);

  if (isLoading)
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

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>영남일보 홈페이지 조회수</h1>
            </div>

            <div className={cstyles.card}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>30일 조회수 트렌드</div>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => `날짜: ${label}`} // X-axis value
                      formatter={(value, name) => [value, groupLabels[name] || name]} // value + friendly name
                    />
                    <Legend formatter={(value) => groupLabels[value] || value} />
                    {allGroups
                      .concat("기타")
                      .map((grp, idx) =>
                        visibleLines[grp] ? (
                          <Line
                            key={grp}
                            type="monotone"
                            dataKey={grp}
                            stroke={["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#17becf"][idx]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                        ) : null
                      )}
                  </LineChart>
                </ResponsiveContainer>

                {/* checkboxes as tabsBar */}
                {/* Checkboxes */}
                <div className={cstyles.selectRow} style={{ marginTop: 12, flexWrap: "wrap" }}>
                  {allGroups.concat("기타").map((grp) => (
                    <label key={grp} className={cstyles.select}>
                      <input type="checkbox" checked={visibleLines[grp]} onChange={() => setVisibleLines((prev) => ({ ...prev, [grp]: !prev[grp] }))} style={{ marginRight: 6 }} />
                      {groupLabels[grp]}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* table */}
            <div className={cstyles.tableWrap} style={{ marginTop: 24 }}>
              <table className={cstyles.table}>
                <thead>
                  <tr className={cstyles.tr}>
                    <th className={cstyles.th}>Page Path</th>
                    {chartData.map((d) => (
                      <th key={d.date} className={cstyles.th}>
                        {d.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allGroups
                    .concat("기타")
                    .filter((grp) => visibleLines[grp])
                    .map((grp) => (
                      <tr key={grp} className={cstyles.tr}>
                        <td className={cstyles.td} data-label="Page Path">{groupLabels[grp]}</td>
                        {chartData.map((d) => (
                          <td key={d.date} className={cstyles.td} data-label={`${groupLabels[grp]} • ${d.date}`}>
                            {d[grp]}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
