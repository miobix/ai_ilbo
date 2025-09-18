"use client";
import React, { useState } from "react";
import Image from "next/image";
import layoutStyles from "./page.module.css";
import chartStyles from "./chart.module.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import StatsSection from "./components/daily-stats/StatsSection";
import ViewsSection from "./components/article-stats/ViewsSection";

export default function Chart() {
  const [activeMain, setActiveMain] = useState("stats");

  return (
    <main className={layoutStyles.main}>
      <Header />
      <div className={layoutStyles.main_inner}>
        <div className={layoutStyles.Main_cont}>
          <div className={chartStyles.tabsBar}>
            <button
              className={`${chartStyles.tabBtn} ${activeMain === "stats" ? chartStyles.active : ""}`}
              onClick={() => setActiveMain("stats")}
            >
              일일 출고현황
            </button>
            <button
              className={`${chartStyles.tabBtn} ${activeMain === "views" ? chartStyles.active : ""}`}
              onClick={() => setActiveMain("views")}
            >
              기사 통계
            </button>
          </div>
          <div className={chartStyles.contentWrap}>
            {activeMain === "stats" && <StatsSection />}
            {activeMain === "views" && <ViewsSection />}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}