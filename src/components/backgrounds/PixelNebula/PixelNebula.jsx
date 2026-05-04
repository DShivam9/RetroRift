import React, { useRef, useEffect, useCallback } from 'react';

/**
 * PixelNebula
 * A retro, low-resolution pixel art nebula effect using a blocky grid.
 */
export const PixelNebula = ({
  speed = 1,
  opacity = 0.4,
  pixelSize = 20,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const time = t * 0.001 * speed;

    ctx.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / pixelSize);
    const rows = Math.ceil(height / pixelSize);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // Noise approximation using sines
        const val1 = Math.sin(x * 0.1 + time * 0.2);
        const val2 = Math.cos(y * 0.1 - time * 0.15);
        const val3 = Math.sin((x + y) * 0.05 + time * 0.1);
        
        const combined = (val1 + val2 + val3) / 3;
        
        if (combined > 0.2) {
          // Purple/Indigo/Cyan palette based on noise
          let color = '#4f46e5'; // Purple
          if (combined > 0.4) color = '#7c3aed'; // Indigo
          if (combined > 0.6) color = '#06b6d4'; // Cyan
          
          ctx.globalAlpha = (combined - 0.2) * opacity;
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize - 1, pixelSize - 1);
        }
      }
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [pixelSize, speed, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  return (
    <div className={`pixel-nebula-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
};

export default PixelNebula;
