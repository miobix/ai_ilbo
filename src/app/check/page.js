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
  const [similarityRateJaccard, setSimilarityRateJaccard] = useState(0);
  const [highlightedText, setHighlightedText] = useState("");
  const [aiPlagiarismRate, setAiPlagiarismRate] = useState("");
  const [aiOriginalityStatus, setAiOriginalityStatus] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [errors, setErrors] = useState({ reporter: false, pressRelease: false });
  const [aiAnalysisText, setAiAnalysisText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const charLimit = 10000;

  const handleReporterChange = (e) => {
    const text = e.target.value.slice(0, charLimit);
    setReporterText(text);
    setErrors((prev) => ({ ...prev, reporter: false }));
  };

  const handlePressReleaseChange = (e) => {
    const text = e.target.value.slice(0, charLimit);
    setPressReleaseText(text);
    setErrors((prev) => ({ ...prev, pressRelease: false }));
  };

  // Simple plagiarism detection algorithm
  const analyzeTexts = async () => {
    const text1 = reporterText.trim();
    const text2 = pressReleaseText.trim();

    // Validate inputs
    if (!text1 || !text2) {
      setErrors({
        reporter: !text1,
        pressRelease: !text2,
      });
      return;
    }

    setIsLoading(true);
    setErrors({ reporter: false, pressRelease: false });

    try {
      // Run local analysis
      const localResult = compareTexts(text1, text2);

      setSimilarityRate(localResult.similarity);
      setSimilarityRateJaccard(localResult.jaccardSimilarity);
      setHighlightedText(localResult.highlightedText);

      //Call AI API
      const aiResponse = await fetch("/api/plagiarism", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporterText: text1,
          pressReleaseText: text2,
        }),
      });

      const result = await aiResponse.json();
      console.log(result)

      // for gpt 4
        // if (result.choices && result.choices.length > 0) {
        // const responseText = result.choices[0].message.content;

      if (result.text && result.text.length > 0) {
        const responseText = result.text

        // Parse the AI response
        const lines = responseText.split("\n").filter((line) => line.trim());
        console.log(lines)
        let plagiarismRate = "";
        let originalityStatus = "";
        let reason = "";
        let suggestions = [];

        // Extract information from AI response
        lines.forEach((line, index) => {
          if (line.includes("표절률:")) {
            plagiarismRate = line.split("표절률:")[1].trim();
          } else if (line.includes("판정:")) {
            originalityStatus = line.split("판정:")[1].trim();
          } else if (line.includes("이유:")) {
            reason = line.split("이유:")[1].trim();
          } else if (line.includes("##개선제안##")) {
            // Collect suggestions from the following lines
            for (let i = index + 1; i < lines.length; i++) {
              const suggestionLine = lines[i].trim();
              if (suggestionLine && suggestionLine.match(/^\d+\./)) {
                const cleanSuggestion = suggestionLine.replace(/^\d+\.\s*/, "");
                if (!cleanSuggestion.includes("[미통과 기준") && !cleanSuggestion.includes("대한 구체적인 제안")) {
                  suggestions.push(cleanSuggestion);
                }
              }
            }
          }
        });

        // Fallback for empty or placeholder suggestions
        if (suggestions.length === 0 || suggestions.every((s) => s.includes("[미통과 기준"))) {
          suggestions = ["구체적인 개선 제안사항을 생성할 수 없습니다.", "AI 분석을 다시 시도해보세요."];
        }

        // Set AI results
        setAiPlagiarismRate(plagiarismRate);
        setAiOriginalityStatus(originalityStatus);
        setAiFeedback(reason);
        setSuggestions(suggestions);
        setAiAnalysisText(responseText);

        
      }

      setHasAnalyzed(true);
    } catch (error) {
      console.error("Error calling plagiarism API", error);
      setAiFeedback("AI 분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Text comparison algorithm - Improved text comparison and highlighting
  const compareTexts = (text1, text2, threshold = 0.6) => {
    const normalize = (str) => str.replace(/\s+/g, " ").trim().toLowerCase();

    // Split texts into sentences or chunks
    const sentences1 = normalize(text1)
      .split(/[.!?]+/)
      .filter(Boolean);
    const sentences2 = normalize(text2)
      .split(/[.!?]+/)
      .filter(Boolean);
    // Track matches with start/end indices
    let matches = [];
    let jaccardMatches = []
    // Get original sentences before normalization for highlighting
    const originalSentences1 = text1.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

    sentences1.forEach((sentence1, index) => {
      const clean1 = sentence1.trim().toLowerCase();
      let hasMatch = false; 

      sentences2.forEach((sentence2) => {
        if (hasMatch) return;

        const clean2 = sentence2.trim().toLowerCase();
        const similarity = calculateSimilarity(clean1, clean2);
        if (similarity >= threshold) {
          matches.push({ text: originalSentences1[index] }); 
          hasMatch = true;
        }

      });
    });

  sentences1.forEach((sentence1, index) => {
  const clean1 = sentence1.trim().toLowerCase();
  let hasMatch = false; 

  sentences2.forEach((sentence2) => {
    if (hasMatch) return;

    const clean2 = sentence2.trim().toLowerCase();
    const jaccardSimilarity = calculateJaccardSimilarity(clean1, clean2);

    if (jaccardSimilarity >= threshold) {
      jaccardMatches.push({ text: originalSentences1[index] }); 
      hasMatch = true;
    }
  });


});

    // Highlight matches in the original text
    let highlightedText = text1;
    matches.forEach((match) => {
const escaped = match.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(escaped, "gu"); // add "u" for Unicode
      highlightedText = highlightedText.replace(regex, `<mark style="background-color: yellow;">$&</mark>`);
    });

    // Overall similarity percentage
    const similarityPercentage = Math.min(100, (matches.length / sentences1.length) * 100);
    const jaccardSimilarityPercentage = Math.min(100, (jaccardMatches.length / sentences1.length) * 100);
    return { similarity: similarityPercentage, jaccardSimilarity: jaccardSimilarityPercentage, highlightedText };
 
  }

//Calculate Jaccard similarity between two strings
const calculateJaccardSimilarity = (str1, str2) => {
  // Convert to lowercase and split into word sets
  const words1 = new Set(
    str1
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)
  );
  const words2 = new Set(
    str2
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)
  );

  // Calculate intersection and union
  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity = intersection / union
  return union.size === 0 ? 0 : intersection.size / union.size;
};

  // Calculate cosine similarity between two strings
  const calculateSimilarity = (str1, str2) => {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'word' });
const tokenize = s => Array.from(segmenter.segment(s.normalize('NFKC').toLowerCase()))
  .filter(x => x.isWordLike)
  .map(x => x.segment);

    const words1 = tokenize(str1);
    const words2 = tokenize(str2);

    const freq1 = {},
      freq2 = {};
    words1.forEach((w) => (freq1[w] = (freq1[w] || 0) + 1));
    words2.forEach((w) => (freq2[w] = (freq2[w] || 0) + 1));

    const allWords = new Set([...words1, ...words2]);

    let dot = 0,
      mag1 = 0,
      mag2 = 0;
    allWords.forEach((word) => {
      const v1 = freq1[word] || 0;
      const v2 = freq2[word] || 0;
      dot += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });

    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  };

  // Count Korean characters (excluding spaces)
  const countKoreanChars = (text) => {
    return text.replace(/\s/g, "").length;
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
                    <div className={styles.statLabel}>유사율 (Cosine)</div>
                    <div className={styles.statValue}>{hasAnalyzed ? `${Math.round(similarityRate)}%` : "-"}</div>
                  </div>
                    <div className={styles.statBlock}>
                    <div className={styles.statLabel}>유사율 (Jaccard)</div>
                    <div className={styles.statValue}>{hasAnalyzed ? `${Math.round(similarityRateJaccard)}%` : "-"}</div>
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
                    <div className={styles.statLabel}>AI 표절률</div>
                    <div className={styles.statValue}>{hasAnalyzed ? aiPlagiarismRate : "-"}</div>
                  </div>
                  <div className={styles.aiStatBlock}>
                    <div className={styles.statLabel}>자체기사 여부</div>
                    <div className={styles.statValue}>{hasAnalyzed ? aiOriginalityStatus : "-"}</div>
                  </div>
                </div>

                <div className={styles.aiResultsContainer}>
                  <div className={styles.aiFeedbackSection}>
                    <h4 className={styles.aiSectionTitle}>분석 결과</h4>
                    <div className={styles.aiFeedbackTextarea}>{hasAnalyzed ? aiFeedback : "AI 분석 결과가 여기에 표시됩니다"}</div>
                  </div>

                  <div className={styles.suggestionsSection}>
                    <h4 className={styles.aiSectionTitle}>개선 제안사항</h4>
                    <div className={styles.suggestionsContainer}>
                      {hasAnalyzed && suggestions.length > 0 ? (
                        <ul className={styles.suggestionsList}>
                          {suggestions.map((suggestion, index) => (
                            <li key={index} className={styles.suggestionItem}>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className={styles.noSuggestions}>개선 제안사항이 여기에 표시됩니다</div>
                      )}
                    </div>
                  </div>
                </div>
                {/* <div className={styles.aiFeedbackTextarea}>{hasAnalyzed ? aiFeedback : "AI 분석 결과가 여기에 표시됩니다"}</div>

                
                {hasAnalyzed && suggestions.length > 0 && (
                  <div className={styles.suggestionsContainer}>
                    <h4 className={styles.suggestionsTitle}>개선 제안사항</h4>
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className={styles.suggestionItem}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}
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


