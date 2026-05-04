import React, { useRef, useEffect, useCallback } from 'react';

/**
 * StarfieldWarp
 * Hyperspace effect with stars streaming from the center.
 * Optimized for performance using refs for all animation variables.
 */
export const StarfieldWarp = ({
  starCount = 300,
  warpSpeed = 2,
  starColor = '#ffffff',
  burstOnClick = true,
  depth = 1000,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const stars = useRef([]);
  const requestRef = useRef();
  const speedRef = useRef(warpSpeed);

  const initStars = useCallback((width, height) => {
    stars.current = [...Array(starCount)].map(() => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * depth
    }));
  }, [starCount, depth]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Fast clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    const currentSpeed = speedRef.current;
    
    stars.current.forEach(s => {
      s.z -= currentSpeed;
      if (s.z <= 1) {
        s.z = depth;
        s.x = (Math.random() - 0.5) * width * 2;
        s.y = (Math.random() - 0.5) * height * 2;
      }

      const k = 128 / s.z;
      const px = s.x * k;
      const py = s.y * k;

      const size = (1 - s.z / depth) * 3;
      
      // Calculate previous position for motion blur
      const pk = 128 / (s.z + currentSpeed * 2);
      const ppx = s.x * pk;
      const ppy = s.y * pk;

      ctx.beginPath();
      ctx.strokeStyle = starColor;
      ctx.lineWidth = size;
      ctx.moveTo(px, py);
      ctx.lineTo(ppx, ppy);
      ctx.stroke();
    });

    ctx.restore();
    requestRef.current = requestAnimationFrame(draw);
  }, [depth, starColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initStars(canvas.width, canvas.height);
    };

    const handleClick = () => {
      if (burstOnClick) {
        speedRef.current = warpSpeed * 10;
        setTimeout(() => {
          speedRef.current = warpSpeed;
        }, 800);
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.parentElement.addEventListener('click', handleClick);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas.parentElement) canvas.parentElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initStars, draw, warpSpeed, burstOnClick]);

  return (
    <div className={`starfield-warp-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default StarfieldWarp;
