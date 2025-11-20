"use client";
import styles from "./page.module.css";
import cstyles from "./chart.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { prepareVisitsChartData, prepareActiveUsersChartData, prepareSectionChartData, prepareSectionActiveUsersData, getAllNcids, getTopNcids, prepareHourlyChartData } from "./utils";
import { allGroups, usersGroups, groupLabels, ncidLabels } from "./constants";

export default function Visits() {
  const [visitsData, setVisitsData] = useState({});
  const [sectionVisitsData, setSectionVisitsData] = useState({});
  const [hourlyVisitsData, setHourlyVisitsData] = useState({});
  const [hourlyPeriod, setHourlyPeriod] = useState(30); // Default 1 month
  const [showAverage, setShowAverage] = useState(false); // Average toggle
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    total: false,
    homeDesktop: true,
    homeMobile: true,
    homeTotal: true,
  });
  const [visibleSectionLines, setVisibleSectionLines] = useState({});
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

        const sectionRes = await fetch("/api/fetchSectionVisits");
        if (sectionRes.ok) {
          const sectionData = await sectionRes.json();
          setSectionVisitsData(sectionData);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticlesData();
  }, []);

  useEffect(() => {
    const fetchHourlyData = async () => {
      try {
        const hourlyRes = await fetch(`/api/fetchHourlyVisits?days=${hourlyPeriod}`);
        if (hourlyRes.ok) {
          const hourlyData = await hourlyRes.json();
          console.log("Hourly data received:", hourlyData);
          setHourlyVisitsData(hourlyData);
        } else {
          console.error("Failed to fetch hourly data:", hourlyRes.status);
        }
      } catch (e) {
        console.error("Error fetching hourly data:", e);
      }
    };
    fetchHourlyData();
  }, [hourlyPeriod]);

  const visitsChartData = prepareVisitsChartData(visitsData);
  const activeUsersChartData = prepareActiveUsersChartData(visitsData);
  const hourlyChartData = prepareHourlyChartData(hourlyVisitsData, showAverage);
  console.log("Hourly chart data:", hourlyChartData);
  const allNcids = getAllNcids(sectionVisitsData);

  function prepareData(data, platform, topNcids) {
    return data.map((d) => {
      const prepared = { date: d.date };
      topNcids.forEach((ncid) => {
        prepared[ncid] = d[ncid] || 0;
      });
      return prepared;
    });
  }

  const topDesktopNcids = getTopNcids(sectionVisitsData, "desktop", 10);
  const topMobileNcids = getTopNcids(sectionVisitsData, "mobile", 10);

  const desktopPageViewsData = prepareData(
    prepareSectionChartData(sectionVisitsData, "desktop"),
    "desktop",
    topDesktopNcids
  );

  const mobilePageViewsData = prepareData(
    prepareSectionChartData(sectionVisitsData, "mobile"),
    "mobile",
    topMobileNcids
  );

  // Get top 8 for legend
  const topLegendNcids = [...new Set([...topDesktopNcids, ...topMobileNcids])].slice(0, 8);

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
            <div className={cstyles.card}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>
                  시간별 조회수 트렌드 (최근 {hourlyPeriod === 180 ? '6개월' : hourlyPeriod === 90 ? '3개월' : '1개월'} {showAverage ? '일평균' : '합산'})
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={showAverage}
                      onChange={(e) => setShowAverage(e.target.checked)}
                    />
                    하루 평균
                  </label>
                  <select 
                    value={hourlyPeriod} 
                    onChange={(e) => setHourlyPeriod(Number(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={30}>1개월</option>
                    <option value={90}>3개월</option>
                    <option value={180}>6개월</option>
                  </select>
                </div>
              </div>
              <div className={styles.cardContentGrow}>
                {hourlyChartData.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>시간별 데이터를 불러오는 중...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={hourlyChartData}>
                      <XAxis dataKey="hour" label={{ value: '시간', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: '조회수', angle: -90, position: 'insideLeft' }} />
                      <Tooltip labelFormatter={(label) => `시간: ${label}`} formatter={(value, name) => [value, groupLabels[name] || name]} />
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
                            dot={true}
                            isAnimationActive={false}
                          />
                        ) : null;
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                )}
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

            {/* Desktop Page Views */}
            <div className={cstyles.card} style={{ marginTop: 24 }}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>섹션별 웹 조회수</div>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={desktopPageViewsData} isAnimationActive={false}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const label = ncidLabels[name] || name;
                        return [value, label];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        return ncidLabels[value] || value;
                      }}
                    />
                    {topDesktopNcids.map((ncid, idx) => (
                      <Bar 
                        key={ncid} 
                        dataKey={ncid} 
                        stackId="desktop" 
                        fill={`hsl(${(idx * 360) / topDesktopNcids.length}, 70%, 50%)`} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mobile Page Views */}
            <div className={cstyles.card} style={{ marginTop: 24 }}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>섹션별 모바일 조회수</div>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mobilePageViewsData} isAnimationActive={false}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const label = ncidLabels[name] || name;
                        return [value, label];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        return ncidLabels[value] || value;
                      }}
                    />
                    {topMobileNcids.map((ncid, idx) => (
                      <Bar 
                        key={ncid} 
                        dataKey={ncid} 
                        stackId="mobile" 
                        fill={`hsl(${(idx * 360) / topMobileNcids.length}, 70%, 35%)`} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
