import React, { useState, useRef } from "react";

function TooltipHighlight({ text, reason, suggestion }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: "100%" });
  const spanRef = useRef();

  const handleShow = () => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    const modalContent = spanRef.current.closest("[data-modal-content]");
    const modalRect = modalContent?.getBoundingClientRect();

    let left = 0;
    let top = "100%";

    if (modalRect) {
      const tooltipWidth = 250;
      const tooltipHeight = 80;

      // For multi-line spans, position based on the first line
      const range = document.createRange();
      const textNode = spanRef.current.firstChild;

      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        // Get the rect of just the first few characters to position on the first line
        range.setStart(textNode, 0);
        range.setEnd(textNode, Math.min(3, textNode.textContent.length));
        const firstLineRect = range.getBoundingClientRect();

        // Calculate space to right from the first line position
        const spaceToRight = modalRect.right - firstLineRect.right;

        if (spaceToRight < tooltipWidth) {
          left = modalRect.right - firstLineRect.left - tooltipWidth - 10;
        } else {
          left = firstLineRect.width;
        }

        // Check vertical position based on first line
        if (firstLineRect.bottom + tooltipHeight > modalRect.bottom) {
          top = -tooltipHeight - 4;
        }
      } else {
        // Fallback to original logic
        const spaceToRight = modalRect.right - rect.left;
        if (spaceToRight < tooltipWidth) {
          left = modalRect.right - rect.left - tooltipWidth - 10;
        }

        if (rect.bottom + tooltipHeight > modalRect.bottom) {
          top = -tooltipHeight - 4;
        }
      }
    }

    setPosition({ left, top });
    setShowTooltip(true);
  };

  return (
    <span
      ref={spanRef}
      style={{
        backgroundColor: "yellow",
        cursor: "pointer",
        position: "relative",
        borderRadius: "2px",
      }}
      onMouseEnter={handleShow}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      {text}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            backgroundColor: "#eee",
            color: "#000",
            padding: "6px 10px",
            borderRadius: "4px",
            whiteSpace: "pre-line",
            fontSize: "0.9rem",
            zIndex: 10,
            minWidth: "150px",
            maxWidth: "250px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ opacity: 0.7 }}>{reason}</div>
          <div style={{ fontWeight: "bold" }}>{suggestion}</div>
        </div>
      )}
    </span>
  );
}

export default TooltipHighlight;
