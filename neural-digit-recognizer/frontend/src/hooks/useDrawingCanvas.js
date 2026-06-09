import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * useDrawingCanvas
 * Attaches mouse + touch drawing to a <canvas> ref.
 * Returns { canvasRef, hasDrawing, clearCanvas, getImageBase64 }
 */
export function useDrawingCanvas() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'var(--canvas-bg, #0a0d14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initCanvas();
    const ctx = canvas.getContext('2d');

    const onStart = (e) => {
      e.preventDefault();
      drawing.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const onMove = (e) => {
      e.preventDefault();
      if (!drawing.current) return;
      const p = getPos(e);
      ctx.lineWidth   = 22;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      setHasDrawing(true);
    };

    const onEnd = () => {
      drawing.current = false;
      ctx.beginPath();
    };

    canvas.addEventListener('mousedown',  onStart);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove',  onMove,  { passive: false });
    canvas.addEventListener('touchend',   onEnd);

    return () => {
      canvas.removeEventListener('mousedown',  onStart);
      canvas.removeEventListener('mousemove',  onMove);
      canvas.removeEventListener('mouseup',    onEnd);
      canvas.removeEventListener('mouseleave', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove',  onMove);
      canvas.removeEventListener('touchend',   onEnd);
    };
  }, [getPos, initCanvas]);

  const clearCanvas = useCallback(() => {
    initCanvas();
    setHasDrawing(false);
  }, [initCanvas]);

  const getImageBase64 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  return { canvasRef, hasDrawing, clearCanvas, getImageBase64 };
}
