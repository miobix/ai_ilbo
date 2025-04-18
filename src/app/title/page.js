"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

import React, { useState, useEffect } from "react";

export default function Title() {
  let availableExamples = [
    "지면전체",
    "웹뉴스",
    // "1면, 종합", "이슈, 기획","정치","사회, 경북","경제, 부동산","건강","대학, 사람&뉴스, 동네뉴스","스포츠","오피니언","토크인사이드, 출향 인사를 찾아서","문화, 위클리","기타"
  ];

  const [text, setText] = useState(""); // State for textarea input
  const [previousText, setPreviousText] = useState(""); // State to track previous text input
  const [charLimit, setCharLimit] = useState(20); // State for character limit input
  const [error, setError] = useState(false); // State for error handling
  const [response, setResponse] = useState(""); // State for API response or generated title
  const [loading, setLoading] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [prompt, setPrompt] = useState([]);
  const subheaderLimit = 80;
  const [exampleList, setExampleList] = useState(availableExamples[0]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (error && e.target.value) setError(false);
  };

  const handleRadioChange = (index) => {
    setExampleList(index);
  };

  //get prompt
  useEffect(() => {
    async function fetchData() {
      setLoadingPrompt(true);
      try {
        const response = await fetch("/api/sheets");
        const result = await response.json();
        setLoadingPrompt(false);
        setPrompt(result);
        console.log("Data fetched:", result[0], result[1]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const getAssistantMessage = async () => {
    console.log("Using assistant API");
    try {
      const assistantResponse = await fetch("/api/openaiAssistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: text,
          characterLimit: charLimit,
          subheaderLimit: subheaderLimit,
          prompt: prompt,
          examplesId: exampleList,
        }),
      });

      const result = await assistantResponse.json();
      console.log(result.choices);
      setLoading(false);

      if (result.choices && result.choices.length > 0) {
        const responseText = result.choices[0].message.content;

        // Split the response by the '##' separator
        let groups = responseText.split("##").map((group) => group.trim());

        let titles = [];
        let subtitles = [];

        groups.forEach((group) => {
          const parts = group.split("&&").map((part) => part.trim());

          if (parts.length === 3) {
            titles.push(parts[0]);
            subtitles.push([parts[1], parts[2]]); // Store subtitles as an array [line1, line2]
          }
        });

        const recommendations = {
          titles: titles,
          subtitles: subtitles,
        };

        setResponse(recommendations);
      } else {
        console.log("No response generated.");
      }
    } catch (error) {
      console.error("Error calling Assistant API", error);
      setLoading(false);
      console.log("An error occurred while generating the title.");
    }
  };

  const getCompletionsMessage = async () => {
    try {
      const openAIResponse = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: text,
          characterLimit: charLimit,
          subheaderLimit: subheaderLimit,
          prompt: prompt,
          examplesId: exampleList,
        }),
      });

      const result = await openAIResponse.json();
      console.log(result.choices);
      console.log(result.usage);
      setLoading(false);
      if (result.choices && result.choices.length > 0) {
        const responseText = result.choices[0].message.content;

        // Split the response by the '&&' separator
        let groups = responseText.split("##").map((group) => group.trim());

        let titles = [];
        let subtitles = [];

        groups.forEach((group) => {
          const parts = group.split("&&").map((part) => part.trim());

          if (parts.length === 3) {
            titles.push(parts[0]);
            subtitles.push([parts[1], parts[2]]); // Store subtitles as an array [line1, line2]
          }
        });

        const recommendations = {
          titles: titles,
          subtitles: subtitles,
        };

        setResponse(recommendations);
      } else {
        console.log("No response generated.");
      }
    } catch (error) {
      console.error("Error calling OpenAI API", error);
      setLoading(false);
      console.log("An error occurred while generating the title.");
    }
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

    // Check if prompts are empty
    if (!prompt.length || !prompt[0] || !prompt[1]) {
      alert("Prompts are empty - please contact the admin");
      return;
    }

    setLoading(true);
    setResponse("");
    setPreviousText(text);

    // Make the API call to OpenAI
    if (exampleList == 0) {
      // call the printed versions: assistant
      getAssistantMessage();
    } else if (exampleList == 1) {
      // call the printed versions: assistant
      getCompletionsMessage();
    } else {
      console.log("unsupported call");
      setLoading(false);
    }
  };

  const handleCharLimitChange = (e) => {
    const value = e.target.value;
    // Allow empty input or any number during typing
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setCharLimit(value);
    }
  };

  // Handle blur event to enforce min/max limits
  const handleCharLimitBlur = () => {
    let value = parseInt(charLimit, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 50) value = 50;
    setCharLimit(value);
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

            {/* Radio Button Section - Multiple lines */}
            <div className={styles.radioButtonContainer}>
              {/* Split into multiple lines for better readability */}
              <div className={styles.radioButtonLine}>
                {availableExamples.slice(0, 5).map((example, index) => (
                  <label key={example} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="optionSelect"
                      checked={exampleList === index}
                      onChange={() => handleRadioChange(index)}
                      className={styles.radioInput}
                    />
                    {example}
                  </label>
                ))}
              </div>
              <div className={styles.radioButtonLine}>
                {availableExamples.slice(5, 10).map((example, index) => (
                  <label key={example} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="optionSelect"
                      checked={exampleList === index + 5}
                      onChange={() => handleRadioChange(index + 5)}
                      className={styles.radioInput}
                    />
                    {example}
                  </label>
                ))}
              </div>
              <div className={styles.radioButtonLine}>
                {availableExamples.slice(10).map((example, index) => (
                  <label key={example} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="optionSelect"
                      checked={exampleList === index + 10}
                      onChange={() => handleRadioChange(index + 10)}
                      className={styles.radioInput}
                    />
                    {example}
                  </label>
                ))}
              </div>
            </div>

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
                disabled={loading || text === previousText || !prompt.length}
              >
                {loadingPrompt ? "프롬프트 로딩 중" : "제목생성"}
              </button>
              {/* <button
                onClick={handleResetClick}
                className={styles.resetButton}
                disabled={loading}
              >
                초기화
              </button> */}
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

                  {/* Render Titles */}
                  {response.titles && response.titles.length > 0 ? (
                    <ul>
                      {response.titles.map((title, index) => (
                        <li key={index} className={styles.recommendationTitle}>
                          {title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No titles available.</p>
                  )}
                  <br />
                  <h2 className={styles.responseTitle}>추천 소제목</h2>
                  {/* Render Subtitles */}

                  {response.subtitles && response.subtitles.length > 0 ? (
                    <ul>
                      {response.subtitles.map((subtitlePair, index) => (
                        <React.Fragment key={index}>
                          <li className={styles.recommendationSubtitle}>
                            {subtitlePair[0]}
                          </li>
                          <li className={styles.recommendationSubtitle}>
                            {subtitlePair[1]}
                          </li>
                          {index < response.subtitles.length - 1 && <hr />}{" "}
                          {/* Divider */}
                        </React.Fragment>
                      ))}
                    </ul>
                  ) : (
                    <p>No subtitles available.</p>
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
