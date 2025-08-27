import React, { useState, useRef } from 'react';

function TooltipHighlight({ text, reason, suggestion }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: '100%' });
  const spanRef = useRef();

  const handleShow = () => {
  if (!spanRef.current) return;
  const rect = spanRef.current.getBoundingClientRect();
  const modalContent = spanRef.current.closest('[data-modal-content]');
  const modalRect = modalContent?.getBoundingClientRect();

  let left = 0;
  let top = '100%';

   if (modalRect) {
    const tooltipWidth = 250;
    const tooltipHeight = 80; 
    
    // Calculate available space to the right of the highlighted text
    const spaceToRight = modalRect.right - rect.left;
    // If tooltip would overflow right edge, position it to fit within modal
    if (spaceToRight < tooltipWidth) {
      left = modalRect.right - rect.left - tooltipWidth - 10; // 10px padding from edge
    }
    
    // Check if tooltip would overflow bottom edge of modal
    if (rect.bottom + tooltipHeight > modalRect.bottom) {
      top = -tooltipHeight - 4; // show above
    }
  }

  setPosition({ left, top });
  setShowTooltip(true);
};

  return (
    <span
      ref={spanRef}
      style={{
        backgroundColor: 'yellow',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '2px'
      }}
      onMouseEnter={handleShow}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      {text}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            backgroundColor: '#eee',
            color: '#000',
            padding: '6px 10px',
            borderRadius: '4px',
            whiteSpace: 'pre-line',
            fontSize: '0.9rem',
            zIndex: 10,
            minWidth: '150px',
            maxWidth: '250px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ opacity: 0.7 }}>{reason}</div>
          <div style={{ fontWeight: 'bold' }}>{suggestion}</div>
        </div>
      )}
    </span>
  );
}

export default TooltipHighlight;