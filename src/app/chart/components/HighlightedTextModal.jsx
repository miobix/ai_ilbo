import React, { useState } from 'react';
import TooltipHighlight from './TooltipHighlight';

export default function HighlightedTextModal({ text, spellings }) {
  if (!text || !spellings || spellings.length === 0) return <span>{text}</span>;

  // Sort by length descending to avoid overlapping shorter matches first
  const sortedSpellings = [...spellings].sort((a, b) => b.mistake.length - a.mistake.length);

  const processText = (inputText) => {
  if (!inputText) return inputText;
  
  // Replace escape sequences with actual characters
  let processed = inputText
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  
  processed = processed.replace(/<[^>]*>/g, '');
  // processed = processed.replace(/\.\s+/g, '.\n');

    let periodCount = 0;

  processed = processed.replace(/\./g, (match, offset, string) => {
    periodCount++;
    // Check if there's whitespace after the period and we've hit the 3rd period
    if (periodCount % 3 === 0 && string[offset + 1] === ' ') {
      return '.\n\n';
    }
    return match;
  });
  
  return processed;
};

  const processedText = processText(text);
let elements = [processedText];

  sortedSpellings.forEach(({ mistake, reason, suggestion }) => {
    const newElements = [];

    elements.forEach((el) => {
      if (typeof el !== 'string') {
        newElements.push(el);
        return;
      }

      const parts = el.split(mistake);
      parts.forEach((part, i) => {
        if (part) newElements.push(part);

        if (i < parts.length - 1) {
          newElements.push(
            <TooltipHighlight
              key={Math.random()}
              text={mistake}
              reason={reason}
              suggestion={suggestion}
            />
          );
        }
      });
    });

    elements = newElements;
  });

  return (
  <div style={{ 
    minHeight: '200px', 
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
    maxWidth: '1000px'
  }}>
    {elements}
  </div>
);
}
