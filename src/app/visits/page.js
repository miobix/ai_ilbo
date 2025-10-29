"use client";
import styles from "./page.module.css";
import cstyles from "./chart.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { prepareVisitsChartData, prepareActiveUsersChartData, prepareSectionChartData, prepareSectionActiveUsersData, getAllNcids, getTopNcids } from "./utils";
import { allGroups, usersGroups, groupLabels, ncidLabels } from "./constants";

export default function Visits() {
  const [visitsData, setVisitsData] = useState({});
  const [sectionVisitsData, setSectionVisitsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLines, setVisibleLines] = useState({
    total: false,
    homeDesktop: true,
    homeMobile: true,
    homeTotal: true,
  });
  const [visibleSectionLines, setVisibleSectionLines] = useState({});
  const [visiblePlatforms, setVisiblePlatforms] = useState({
    desktop: true,
    mobile: true,
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

  const visitsChartData = prepareVisitsChartData(visitsData);
  const activeUsersChartData = prepareActiveUsersChartData(visitsData);
  const allNcids = getAllNcids(sectionVisitsData);

  function combinePlatformData(desktopData, mobileData, platforms, topDesktop, topMobile) {
    if (!platforms.desktop && !platforms.mobile) return [];
    if (platforms.desktop && !platforms.mobile) return desktopData;
    if (!platforms.desktop && platforms.mobile) return mobileData;

    // Both platforms: combine data with top ncids only
    const relevantNcids = new Set([...topDesktop, ...topMobile]);

    return desktopData.map((dData, idx) => {
      const combined = { date: dData.date };
      const mData = mobileData[idx] || {};

      relevantNcids.forEach((ncid) => {
        if (topDesktop.includes(ncid)) {
          combined[`${ncid}_desktop`] = dData[ncid] || 0;
        }
        if (topMobile.includes(ncid)) {
          combined[`${ncid}_mobile`] = mData[ncid] || 0;
        }
      });

      return combined;
    });
  }

  const topDesktopNcids = getTopNcids(sectionVisitsData, "desktop", 5);
  const topMobileNcids = getTopNcids(sectionVisitsData, "mobile", 5);

  const sectionPageViewsData = combinePlatformData(
    prepareSectionChartData(sectionVisitsData, "desktop"),
    prepareSectionChartData(sectionVisitsData, "mobile"),
    visiblePlatforms,
    topDesktopNcids,
    topMobileNcids
  );

  const sectionActiveUsersData = combinePlatformData(
    prepareSectionActiveUsersData(sectionVisitsData, "desktop"),
    prepareSectionActiveUsersData(sectionVisitsData, "mobile"),
    visiblePlatforms,
    topDesktopNcids,
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

            {/* Section Desktop Page Views */}
            <div className={cstyles.card} style={{ marginTop: 24 }}>
              <div className={cstyles.cardHeader}>
                <div className={cstyles.cardTitle}>섹션별 웹 조회수</div>
              </div>
              <div className={cstyles.selectRow} style={{ marginTop: 12, flexWrap: "wrap" }}>
                <label className={cstyles.select}>
                  <input type="checkbox" checked={visiblePlatforms.desktop} onChange={() => setVisiblePlatforms((prev) => ({ ...prev, desktop: !prev.desktop }))} style={{ marginRight: 6 }} />웹
                </label>
                <label className={cstyles.select}>
                  <input type="checkbox" checked={visiblePlatforms.mobile} onChange={() => setVisiblePlatforms((prev) => ({ ...prev, mobile: !prev.mobile }))} style={{ marginRight: 6 }} />
                  모바일
                </label>
              </div>
              <div className={styles.cardContentGrow}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sectionPageViewsData} isAnimationActive={false}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const [ncid, platform] = name.split("_");
                        const label = `${ncidLabels[ncid] || ncid}${platform ? ` (${platform === "desktop" ? "웹" : "모바일"})` : ""}`;
                        return [value, label];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        const [ncid, platform] = value.split("_");
                        return `${ncidLabels[ncid] || ncid}${platform ? ` (${platform === "desktop" ? "웹" : "모바일"})` : ""}`;
                      }}
                    />
                    {visiblePlatforms.desktop && visiblePlatforms.mobile ? (
                      // Both platforms: show desktop and mobile stacks
                      <>
                        {allNcids.map((ncid, idx) => (
                          <Bar key={`${ncid}_desktop`} dataKey={`${ncid}_desktop`} stackId="desktop" fill={`hsl(${(idx * 360) / allNcids.length}, 70%, 50%)`} />
                        ))}
                        {allNcids.map((ncid, idx) => (
                          <Bar key={`${ncid}_mobile`} dataKey={`${ncid}_mobile`} stackId="mobile" fill={`hsl(${(idx * 360) / allNcids.length}, 70%, 35%)`} />
                        ))}
                      </>
                    ) : (
                      // Single platform
                      allNcids.map((ncid, idx) => <Bar key={ncid} dataKey={ncid} stackId="a" fill={`hsl(${(idx * 360) / allNcids.length}, 70%, 50%)`} />)
                    )}
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
