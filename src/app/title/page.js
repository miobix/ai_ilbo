"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Title() {
  const [text, setText] = useState(""); // State for textarea input
  const [previousText, setPreviousText] = useState(""); // State to track previous text input
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

  const handleGenerateClick = async () => {
    if (loading) return;


    if (text === previousText) {
      return;
    }

    if (!text) {
      setError(true);
      return;
    }

    setLoading(true);
    setResponse("");
    setPreviousText(text);

    // Make the API call to OpenAI
    try {
      const openAIResponse = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: text,
          characterLimit: charLimit,
        }),
      });

      const result = await openAIResponse.json();
      console.log(result.choices);
      console.log(result.usage);
      setLoading(false);
      if (result.choices && result.choices.length > 0) {
        const responseText = result.choices[0].message.content;
        let parts = responseText.split("##").map((part) => part.trim());

        if (parts.length > 12) {
          parts = parts.slice(0, 12);
        }

    // Group the parts into recommendations (title and key takeaways)
      const recommendations = [];
      for (let i = 0; i < parts.length; i += 4) {
        const title = parts[i];
        const takeaways = parts.slice(i + 1, i + 4);
        recommendations.push({ title, takeaways });
      }

        setResponse(recommendations);
      } else {
        setResponse("No response generated.");
      }
    } catch (error) {
      console.error("Error calling OpenAI API", error);
      setLoading(false);
      setResponse("An error occurred while generating the title.");
    }
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
            <h1 className={styles.title}>제목 생성</h1>
            <p className={styles.paragraph}></p>
            <textarea
              className={`${styles.textarea} ${
                error ? styles.errorTextarea : ""
              }`}
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
                disabled={loading || text === previousText}
              >
                제목생성
              </button>
              <button
                onClick={handleResetClick}
                className={styles.resetButton}
                disabled={loading}
              >
                초기화
              </button>
            </div>

            {/* Response Section */}
            {loading && response === "" ? (
              <div className={styles.responseSection}>
                <p>Loading...</p>
              </div>
            ) : (
              response && (
                <div className={styles.responseSection}>
                  <h2 className={styles.responseTitle}>추천 제목</h2>

                  {response && response.length > 0 ? (
                    response.map((item, index) => (
                      <div key={index} className={styles.recommendation}>
                        <h3 className={styles.recommendationTitle}>{item.title}</h3>
                        <ul className={styles.keyTakeaways}>
                          {item.takeaways.map((takeaway, idx) => (
                            <li key={idx}>{takeaway}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p>No recommendations available.</p>
                  )}
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
