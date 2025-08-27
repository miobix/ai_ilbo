import React, { useState } from 'react';
import TooltipHighlight from './TooltipHighlight';

export default function HighlightedTextModal({ text, spellings }) {
  if (!text || !spellings || spellings.length === 0) return <span>{text}</span>;

  // Sort by length descending to avoid overlapping shorter matches first
  const sortedSpellings = [...spellings].sort((a, b) => b.mistake.length - a.mistake.length);

  // Build a list of React elements for highlighted text
  let elements = [text];

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

  return <div>{elements}</div>;
}
