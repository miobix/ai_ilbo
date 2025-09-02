import React, { useState } from "react";
import TooltipHighlight from "./TooltipHighlight";

export default function HighlightedTextModal({ text, spellings }) {
  if (!text || !spellings || spellings.length === 0) return <span>{text}</span>;

  // Sort by length descending to avoid overlapping shorter matches first
  const sortedSpellings = [...spellings].sort((a, b) => b.mistake.length - a.mistake.length);

  const processText = (inputText) => {
  if (!inputText) return inputText;

  // Remove img tags completely
  let processed = inputText.replace(/<img[^>]*>/g, "");

  // Convert HTML entities to actual characters
  processed = processed.replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&amp;/g, "&")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

  // Convert <br/> and <br> tags to line breaks
  processed = processed.replace(/<br\s*\/?>/g, "\n");

  // Remove any remaining HTML tags
  processed = processed.replace(/<[^>]*>/g, "");

  // Convert multiple consecutive line breaks to paragraph breaks
  processed = processed.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace at start and end
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
