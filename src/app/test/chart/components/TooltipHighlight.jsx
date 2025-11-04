import React, { useState, useRef } from "react";

function TooltipHighlight({ text, reason, suggestion }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: "100%" });
  const spanRef = useRef();

  const handleShow = () => {
    if (!spanRef.current) return;
    
    const span = spanRef.current;
    const spanRect = span.getBoundingClientRect();
    
    // Find the scrollable container
    let modal = span.closest("[data-modal-content]");
    if (!modal) {
      let parent = span.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          modal = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }
    if (!modal) modal = document.body;
    
    const modalRect = modal.getBoundingClientRect();
    const tooltipWidth = 250;
    const tooltipHeight = 100;
    const margin = 10;

    // Use fixed positioning with viewport coordinates
    let tooltipLeft = spanRect.left;
    let tooltipTop = spanRect.bottom + 4;

    // Check if tooltip fits on the right side
    if (tooltipLeft + tooltipWidth + margin > modalRect.right) {
      // Shift left to fit within modal
      tooltipLeft = modalRect.right - tooltipWidth - margin;
    }

    // Make sure it doesn't go past left edge
    if (tooltipLeft < modalRect.left + margin) {
      tooltipLeft = modalRect.left + margin;
    }

    // Vertical positioning
    if (tooltipTop + tooltipHeight + margin > modalRect.bottom) {
      // Position above if no room below
      tooltipTop = spanRect.top - tooltipHeight - 4;
    }

    setPosition({ 
      left: Math.round(tooltipLeft), 
      top: Math.round(tooltipTop),
      isFixed: true 
    });
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
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            backgroundColor: "#333",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            whiteSpace: "pre-line",
            fontSize: "0.85rem",
            zIndex: 9999,
            width: "250px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            border: "1px solid #555",
            pointerEvents: "none",
            lineHeight: "1.4",
          }}
        >
          <div style={{ opacity: 0.8, marginBottom: "4px", fontSize: "0.8rem" }}>
            {reason}
          </div>
          <div style={{ fontWeight: "600", color: "#ffd700" }}>
            {suggestion}
          </div>
        </div>
      )}
    </span>
  );
}

export default TooltipHighlight;
