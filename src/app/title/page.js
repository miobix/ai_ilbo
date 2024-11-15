"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Title() {
  const [text, setText] = useState(""); // State for textarea input
  const [charLimit, setCharLimit] = useState(20); // State for character limit input
  const [error, setError] = useState(false); // State for error handling
  const [response, setResponse] = useState(""); // State for API response or generated title
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setText(e.target.value);
    if (error && e.target.value) setError(false);
  };

  const handleCharLimitChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setCharLimit(value);
    }
  };

  const handleCharLimitBlur = () => {
    let value = parseInt(charLimit, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 50) value = 50;
    setCharLimit(value);
  };

  const handleGenerateClick = () => {
    if (response !== "") return;

    if (!text) {
      setError(true);
      return;
    }

    setLoading(true);
    setResponse(""); 
    setTimeout(() => {
      setLoading(false);
      setResponse("Generated Response Placeholder");
    }, 1000);
  };

  const handleResetClick = () => {
    setText("");
    setCharLimit(20);
    setError(false);
    setResponse("");
    console.log("Reset button clicked: 초기화");
  };

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <h1 className={styles.title}>영남ai 기사 제목 생겅</h1>
            <p className={styles.paragraph}></p>
            <textarea
                className={`${styles.textarea} ${error ? styles.errorTextarea : ""}`}
                value={text}
              onChange={handleChange}
              placeholder="기사 텍스트 붙여넣으세요..."
            />

            {/* Input section for character limit */}
            <div className={styles.charLimitSection}>
              <label className={styles.charLimitLabel}>글자 수 제한:</label>
              <input
                type="text"
                className={styles.charLimitInput}
                value={charLimit}
                onChange={handleCharLimitChange}
                onBlur={handleCharLimitBlur}
                placeholder="20"
              />
              <button
                className={styles.generateButton}
                onClick={handleGenerateClick}
              >
                제목생성
              </button>
              <button
                onClick={handleResetClick}
                className={styles.resetButton}
              >
                초기화
              </button>

        
            </div>

                    {/* Response Section */}
                    {loading && response === "" ? (
              <div className={styles.responseSection}>
                <p>Loading...</p>
              </div>
            ) : (response && (
              <div className={styles.responseSection}>
                <h2 className={styles.responseTitle}>추천 제목</h2>

                {/* Title 1 */}
                <div className={styles.recommendation}>
                  <h3 className={styles.recommendationTitle}>제목 1</h3>
                  <ul className={styles.keyTakeaways}>
                    <li>키 테이크어웨이 1</li>
                    <li>키 테이크어웨이 2</li>
                    <li>키 테이크어웨이 3</li>
                  </ul>
                </div>

                {/* Title 2 */}
                <div className={styles.recommendation}>
                  <h3 className={styles.recommendationTitle}>제목 2</h3>
                  <ul className={styles.keyTakeaways}>
                    <li>키 테이크어웨이 1</li>
                    <li>키 테이크어웨이 2</li>
                    <li>키 테이크어웨이 3</li>
                  </ul>
                </div>

                {/* Title 3 */}
                <div className={styles.recommendation}>
                  <h3 className={styles.recommendationTitle}>제목 3</h3>
                  <ul className={styles.keyTakeaways}>
                    <li>키 테이크어웨이 1</li>
                    <li>키 테이크어웨이 2</li>
                    <li>키 테이크어웨이 3</li>
                  </ul>
                </div>
              </div>
            )
          )}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
