"use client";
import styles from "./page.module.css";
import cstyles from "./chart.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const allGroups = ["homeDesktop", "homeMobile", "homeTotal", "total"];
const usersGroups = ["homeDesktop", "homeMobile", "homeTotal", "total"];
const groupLabels = {
  homeDesktop: "홈 웹",
  homeMobile: "홈 모바일",
  total: "총",
  homeTotal: "홈 합계",
};

function prepareVisitsChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  const visitsChartData = visitsData.total.map((tEntry, i) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    const homeDesktop = visitsData.homeDesktop?.[i]?.pageViews || 0;
    const homeMobile = visitsData.homeMobile?.[i]?.pageViews || 0;
    const total = visitsData.total?.[i]?.pageViews || 0;

    obj.homeTotal = homeDesktop + homeMobile;

    obj.homeDesktop = homeDesktop;
    obj.homeMobile = homeMobile;
    obj.total = total;

    return obj;
  });

  return visitsChartData;
}

function prepareActiveUsersChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  const visitsChartData = visitsData.total.map((tEntry, i) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    const homeDesktop = visitsData.homeDesktop?.[i]?.activeUsers || 0;
    const homeMobile = visitsData.homeMobile?.[i]?.activeUsers || 0;
    const total = visitsData.total?.[i]?.activeUsers || 0;

    obj.homeTotal = homeDesktop + homeMobile;

    obj.homeDesktop = homeDesktop;
    obj.homeMobile = homeMobile;
    obj.total = total;

    return obj;
  });

  return visitsChartData;
}

function formatDateMMDD(dateStr) {
  return dateStr.slice(4, 6) + "-" + dateStr.slice(6, 8);
}

export default function Visits() {
  const [visitsData, setVisitsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    total: false,
    homeDesktop: true,
    homeMobile: true,
    homeTotal: true,
  });

  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
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

  const visitsChartData = prepareVisitsChartData(visitsData);
  const activeUsersChartData = prepareActiveUsersChartData(visitsData);

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
              <h1 className={styles.pageTitle}>영남일보 홈페이지 접속 통계</h1>
            </div>
            {/* Checkboxes */}
            <div className={cstyles.selectRow} style={{ marginTop: 12, flexWrap: "wrap" }}>
              {allGroups.map((grp) => (
                <label key={grp} className={cstyles.select}>
                  <input type="checkbox" checked={visibleLines[grp]} onChange={() => setVisibleLines((prev) => ({ ...prev, [grp]: !prev[grp] }))} style={{ marginRight: 6 }} />
                  {groupLabels[grp]}
                </label>
              ))}
            </div>
            <div className={cstyles.card}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>60일 조회수 트렌드</div>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={visitsChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `날짜: ${label}`} formatter={(value, name) => [value, groupLabels[name] || name]} />
                    <Legend formatter={(value) => groupLabels[value] || value} />
                    {allGroups.map((grp, idx) => {
                      const isHomeTotal = grp === "homeTotal";
                      return visibleLines[grp] ? (
                        <Line
                          key={grp}
                          type="monotone"
                          dataKey={grp}
                          stroke={isHomeTotal ? "#000000" : ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"][idx]}
                          strokeWidth={isHomeTotal ? 3.5 : 2}
                          strokeOpacity={isHomeTotal ? 1 : 0.6}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ) : null;
                    })}
                  </LineChart>
                </ResponsiveContainer>

                {/* checkboxes as tabsBar */}
              </div>
            </div>

            <div className={cstyles.card}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>60일 활성 사용자 트렌드</div>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={activeUsersChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => `날짜: ${label}`} formatter={(value, name) => [value, groupLabels[name] || name]} />
                    <Legend formatter={(value) => groupLabels[value] || value} />
                    {allGroups.map((grp, idx) => {
                      const isHomeTotal = grp === "homeTotal";
                      return visibleLines[grp] ? (
                        <Line
                          key={grp}
                          type="monotone"
                          dataKey={grp}
                          stroke={isHomeTotal ? "#000000" : ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"][idx]}
                          strokeWidth={isHomeTotal ? 3.5 : 2}
                          strokeOpacity={isHomeTotal ? 1 : 0.6}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ) : null;
                    })}
                  </LineChart>
                </ResponsiveContainer>

                {/* checkboxes as tabsBar */}
                {/* Checkboxes */}
                {/* <div className={cstyles.selectRow}>
                  {allGroups.map((grp) => (
                    <label key={grp} className={cstyles.select}>
                      <input type="checkbox" checked={visibleLines[grp]} onChange={() => setVisibleLines((prev) => ({ ...prev, [grp]: !prev[grp] }))} style={{ marginRight: 6 }} />
                      {groupLabels[grp]}
                    </label>
                  ))}
                </div> */}
              </div>
            </div>

            {/* page views table */}
            <div className={cstyles.tableWrap} style={{ marginTop: 24 }}>
              <table className={cstyles.table}>
                <thead>
                  <tr className={cstyles.tr}>
                    <th className={cstyles.th}>Page Path</th>
                    {visitsChartData.map((d) => (
                      <th key={d.date} className={cstyles.th}>
                        {d.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allGroups

                    .filter((grp) => visibleLines[grp])
                    .map((grp) => (
                      <tr key={grp} className={cstyles.tr}>
                        <td className={cstyles.td} data-label="Page Path">
                          {groupLabels[grp]}
                        </td>
                        {visitsChartData.map((d) => (
                          <td key={d.date} className={cstyles.td} data-label={`${groupLabels[grp]} • ${d.date}`}>
                            {d[grp]}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* active users table */}
            <div className={cstyles.tableWrap} style={{ marginTop: 24 }}>
              <table className={cstyles.table}>
                <thead>
                  <tr className={cstyles.tr}>
                    <th className={cstyles.th}>Active Users</th>
                    {activeUsersChartData.map((d) => (
                      <th key={d.date} className={cstyles.th}>
                        {d.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allGroups

                    .filter((grp) => visibleLines[grp])
                    .map((grp) => (
                      <tr key={grp} className={cstyles.tr}>
                        <td className={cstyles.td} data-label="Active Users">
                          {groupLabels[grp]}
                        </td>
                        {activeUsersChartData.map((d) => (
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
