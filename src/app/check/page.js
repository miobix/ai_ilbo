"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";

export default function Check() {
  const [reporterText, setReporterText] = useState(""); 
  const [pressReleaseText, setPressReleaseText] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [similarityRate, setSimilarityRate] = useState(0);
  const [highlightedText, setHighlightedText] = useState("");
  const [aiPlagiarismRate, setAiPlagiarismRate] = useState("");
  const [aiOriginalityStatus, setAiOriginalityStatus] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [errors, setErrors] = useState({ reporter: false, pressRelease: false });

  const charLimit = 10000;

  const handleReporterChange = (e) => {
    const text = e.target.value.slice(0, charLimit);
    setReporterText(text);
    setErrors(prev => ({ ...prev, reporter: false }));
  };

  const handlePressReleaseChange = (e) => {
    const text = e.target.value.slice(0, charLimit);
    setPressReleaseText(text);
    setErrors(prev => ({ ...prev, pressRelease: false }));
  };

  // Simple plagiarism detection algorithm
  const analyzeTexts = () => {
    const text1 = reporterText.trim();
    const text2 = pressReleaseText.trim();
    
    // Validate inputs
    if (!text1 || !text2) {
      setErrors({
        reporter: !text1,
        pressRelease: !text2
      });
      return;
    }

    setIsLoading(true);
    setErrors({ reporter: false, pressRelease: false });

    // Simulate processing time
    setTimeout(() => {
      const result = compareTexts(text1, text2);
      setSimilarityRate(result.similarity);
      setHighlightedText(result.highlightedText);
      
      // Simulate AI results
      setAiPlagiarismRate(`${Math.round(result.similarity)}%`);
      setAiOriginalityStatus(result.similarity > 30 ? "표절 의심" : "자체기사");
      setAiFeedback("AI 분석 결과가 여기에 표시됩니다. 기사의 독창성을 높이기 위한 제안사항들이 포함될 예정입니다.");
      
      setHasAnalyzed(true);
      setIsLoading(false);
    }, 100);
  };

  // Text comparison algorithm
  const compareTexts = (text1, text2) => {
    // Split texts into sentences
    const sentences1 = text1.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sentences2 = text2.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    let matchedPhrases = [];
    let totalMatches = 0;

    // Compare sentences with fuzzy matching
    sentences1.forEach(sentence1 => {
      const cleanSentence1 = sentence1.trim().toLowerCase();
      sentences2.forEach(sentence2 => {
        const cleanSentence2 = sentence2.trim().toLowerCase();
        const similarity = calculateSimilarity(cleanSentence1, cleanSentence2);
        
        if (similarity > 0.7) { // 70% similarity threshold
          matchedPhrases.push(sentence1.trim());
          totalMatches++;
        }
      });
    });

    // Calculate overall similarity percentage
    const similarityPercentage = Math.min(100, (totalMatches / sentences1.length) * 100);

    // Create highlighted text
    let highlightedText = text1;
    matchedPhrases.forEach(phrase => {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      highlightedText = highlightedText.replace(regex, `<mark style="background-color: yellow;">${phrase}</mark>`);
    });

    return {
      similarity: similarityPercentage,
      highlightedText: highlightedText
    };
  };

  // Calculate similarity between two strings using Levenshtein distance
  const calculateSimilarity = (str1, str2) => {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - (matrix[len2][len1] / maxLen);
  };

  // Count Korean characters (excluding spaces)
  const countKoreanChars = (text) => {
    return text.replace(/\s/g, '').length;
  };

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.main_inner}>
        <div className={styles.Main_cont}>
          <div className={styles.Main_cont_inner}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>보도자료 표절 검사기</h1>
              <p className={styles.pageSubtitle}>기사와 원본 보도자료를 비교하여 표절률을 분석합니다</p>
            </div>

            <div className={styles.sectionsContainer}>
              {/* Section 1: Reporter Text Input */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>검사할 기사 내용</h3>
                <div className={styles.charCount}>
                  {countKoreanChars(reporterText)} / {charLimit}
                </div>
                <textarea
                  className={`${styles.sectionTextarea} ${errors.reporter ? styles.errorTextarea : ""}`}
                  value={reporterText}
                  onChange={handleReporterChange}
                  placeholder="기사 텍스트를 붙여넣으세요..."
                />
                {errors.reporter && <div className={styles.errorMessage}>내용을 입력해주세요</div>}
              </div>

              {/* Section 2: Press Release Text Input */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>비교할 보도자료/원본</h3>
                <div className={styles.charCount}>
                  {countKoreanChars(pressReleaseText)} / {charLimit}
                </div>
                <textarea
                  className={`${styles.sectionTextarea} ${errors.pressRelease ? styles.errorTextarea : ""}`}
                  value={pressReleaseText}
                  onChange={handlePressReleaseChange}
                  placeholder="원본 보도자료를 붙여넣으세요..."
                />
                {errors.pressRelease && <div className={styles.errorMessage}>내용을 입력해주세요</div>}
              </div>

              {/* Section 3: Program Results */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>검사 결과</h3>

                <div className={styles.statsContainer}>
                  <div className={styles.statBlock}>
                    <div className={styles.statLabel}>유사율</div>
                    <div className={styles.statValue}>{hasAnalyzed ? `${Math.round(similarityRate)}%` : "-"}</div>
                  </div>
                  <div className={styles.statBlock}>
                    <div className={styles.statLabel}>기사 글자수</div>
                    <div className={styles.statValue}>{countKoreanChars(reporterText)}</div>
                  </div>
                  <div className={styles.statBlock}>
                    <div className={styles.statLabel}>원본 글자수</div>
                    <div className={styles.statValue}>{countKoreanChars(pressReleaseText)}</div>
                  </div>
                </div>

                <div
                  className={styles.resultTextarea}
                  dangerouslySetInnerHTML={{
                    __html: hasAnalyzed ? highlightedText : reporterText || "분석 결과가 여기에 표시됩니다",
                  }}
                />
              </div>

              {/* Section 4: AI Results */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>AI 분석 결과</h3>

                <div className={styles.aiStatsContainer}>
                  <div className={styles.aiStatBlock}>
                    <div className={styles.statLabel}>표절률</div>
                    <div className={styles.statValue}>{hasAnalyzed ? aiPlagiarismRate : "-"}</div>
                  </div>
                  <div className={styles.aiStatBlock}>
                    <div className={styles.statLabel}>자체기사 여부</div>
                    <div className={styles.statValue}>{hasAnalyzed ? aiOriginalityStatus : "-"}</div>
                  </div>
                </div>

                <div className={styles.aiFeedbackTextarea}>{hasAnalyzed ? aiFeedback : "AI 분석 결과가 여기에 표시됩니다"}</div>
              </div>
            </div>

            {/* Analysis Button */}
            <div className={styles.buttonContainer}>
              <button className={styles.analyzeButton} onClick={analyzeTexts} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    분석중...
                  </>
                ) : (
                  <>🔍 조회</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}