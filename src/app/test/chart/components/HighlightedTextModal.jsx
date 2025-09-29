import React, { useState } from "react";
import TooltipHighlight from "./TooltipHighlight";

export default function HighlightedTextModal({ text, spellings }) {
  if (!text || !spellings || spellings.length === 0) return <span>{text}</span>;

  // Sort by length descending to avoid overlapping shorter matches first
  const sortedSpellings = [...spellings].sort((a, b) => b.mistake.length - a.mistake.length);

  const processText = (inputText) => {
  if (!inputText) return inputText;

  let processed = inputText;

  // First: Convert HTML entities to actual characters (this is crucial)
  processed = processed.replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&")
                    .replace(/&nbsp;/g, " ");

  // Now process HTML tags for line breaks BEFORE removing them
  // Convert <br/> and <br> tags to line breaks
  processed = processed.replace(/<br\s*\/?>/gi, "\n");
  
  // Convert div tags to line breaks (both opening and closing)
  processed = processed.replace(/<div[^>]*>/gi, "\n")
                      .replace(/<\/div>/gi, "\n");

  // Convert &lt;br/&gt; patterns that might be double-encoded
  processed = processed.replace(/&lt;br\s*\/?&gt;/gi, "\n");

  // Remove img tags completely
  processed = processed.replace(/<img[^>]*>/g, "");

  // Remove bold tags but keep content
  processed = processed.replace(/<\/?b>/gi, "");

  // Remove any remaining HTML tags
  processed = processed.replace(/<[^>]*>/g, "");

  // Convert literal \n in the text to actual line breaks
  processed = processed.replace(/\\n/g, "\n");

  // Add line breaks before section headers (◆)
  processed = processed.replace(/\s*(◆[^◆\n]*)/g, "\n\n$1");
  
  // Add line breaks before reporter byline
  processed = processed.replace(/\s*([가-힣]{2,4}기자\s+[a-zA-Z@.]+)/g, "\n\n$1");

  // Clean up excessive whitespace
  processed = processed.replace(/[ \t]+/g, " ")  // Multiple spaces to single space
                      .replace(/\n[ \t]+/g, "\n")  // Remove spaces after line breaks  
                      .replace(/[ \t]+\n/g, "\n")  // Remove spaces before line breaks
                      .replace(/\n{3,}/g, "\n\n");  // Max 2 consecutive line breaks

  // Remove leading/trailing whitespace
  processed = processed.trim();

  return processed;
};

  const processedText = processText(text);
  let elements = [processedText];

  sortedSpellings.forEach(({ mistake, reason, suggestion }) => {
    const newElements = [];

    elements.forEach((el) => {
      if (typeof el !== "string") {
        newElements.push(el);
        return;
      }

      const parts = el.split(mistake);
      parts.forEach((part, i) => {
        if (part) newElements.push(part);

        if (i < parts.length - 1) {
          newElements.push(<TooltipHighlight key={Math.random()} text={mistake} reason={reason} suggestion={suggestion} />);
        }
      });
    });

    elements = newElements;
  });

  return (
    <div
      style={{
        minHeight: "200px",
        lineHeight: "1.6",
        whiteSpace: "pre-line",
        maxWidth: "1000px",
      }}
    >
      {elements}
    </div>
  );
}
