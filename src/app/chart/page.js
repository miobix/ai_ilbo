"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Chart() {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.main_inner}>
          <div className={styles.Main_cont}>
            <div 
              className={styles.Main_cont_inner}
              style={{ height: "calc(100vh - 200px)" }} // Adjust the 200px based on your header/footer height
            >
              <iframe
                src="https://yeongnamilbo-chart.vercel.app/"
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }