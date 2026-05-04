import React, { useRef, useEffect, useCallback } from 'react';

/**
 * CircuitBoardTrace
 * Animated glowing lines that travel along a grid, simulating PCB traces.
 */
export const CircuitBoardTrace = ({
  traceColor = '#8b5cf6',
  gridSize = 40,
  traceSpeed = 2,
  dotSize = 2,
  glowIntensity = 15,
  opacity = 0.4,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const traces = useRef([]);
  const requestRef = useRef();

  const createTrace = useCallback((width, height) => {
    const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
    const horizontal = Math.random() > 0.5;
    
    return {
      x, y,
      startX: x, startY: y,
      length: 0,
      maxLength: (Math.random() * 5 + 2) * gridSize,
      horizontal,
      dir: Math.random() > 0.5 ? 1 : -1,
      life: 1,
      fadeSpeed: 0.005 + Math.random() * 0.01
    };
  }, [gridSize]);

  const draw = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    
    // Draw grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Update and draw traces
    traces.current.forEach((tr, index) => {
      tr.length += traceSpeed;
      if (tr.length > tr.maxLength) {
        tr.life -= tr.fadeSpeed;
      }

      if (tr.life <= 0) {
        traces.current[index] = createTrace(width, height);
      }

      ctx.save();
      ctx.globalAlpha = tr.life * opacity;
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = glowIntensity;
      ctx.shadowColor = traceColor;

      ctx.beginPath();
      ctx.moveTo(tr.startX, tr.startY);
      if (tr.horizontal) {
        ctx.lineTo(tr.startX + tr.length * tr.dir, tr.startY);
      } else {
        ctx.lineTo(tr.startX, tr.startY + tr.length * tr.dir);
      }
      ctx.stroke();
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(draw);
  }, [traceColor, gridSize, traceSpeed, dotSize, glowIntensity, opacity, createTrace]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      traces.current = [...Array(15)].map(() => createTrace(canvas.width, canvas.height));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [createTrace, draw]);

  return (
    <div className={`circuit-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
};

export default CircuitBoardTrace;
