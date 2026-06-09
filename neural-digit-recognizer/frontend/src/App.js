import React from 'react';
import { useDrawingCanvas } from './hooks/useDrawingCanvas';
import { usePredict }       from './hooks/usePredict';
import { DrawingCanvas }    from './components/DrawingCanvas';
import { PredictionPanel }  from './components/PredictionPanel';
import { ModelAnalysis }    from './components/ModelAnalysis';
import styles from './App.module.css';

// Icons (inline SVG for zero dependencies)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l3 3"/>
  </svg>
);

export default function App() {
  const { canvasRef, hasDrawing, clearCanvas, getImageBase64 } = useDrawingCanvas();
  const { predict, result, loading, error, reset } = usePredict();

  const handleClear = () => {
    clearCanvas();
    reset();
  };

  const handlePredict = async () => {
    const img = getImageBase64();
    if (!img) return;
    await predict(img);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <span className={styles.badge}>AI POWERED</span>
      <h1 className={styles.heading}>
        Neural Digit <span>Recognizer</span>
      </h1>
      <p className={styles.subtitle}>
        Draw a single digit (0–9) in the box below, and our Convolutional
        Neural Network will predict it in real-time.
      </p>

      {/* Main card */}
      <div className={styles.card}>
        {/* Left column */}
        <div className={styles.left}>
          <DrawingCanvas canvasRef={canvasRef} />

          {error && (
            <div className={styles.error}>
              ⚠ {error}
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              className={`${styles.btn} ${styles.btnClear}`}
              onClick={handleClear}
              disabled={loading}
            >
              <TrashIcon /> Clear
            </button>
            <button
              className={`${styles.btn} ${styles.btnPredict}`}
              onClick={handlePredict}
              disabled={loading || !hasDrawing}
            >
              {loading
                ? <><span className={styles.btnSpinner} /> Analyzing…</>
                : <><BrainIcon /> Predict Digit</>
              }
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <PredictionPanel result={result} loading={loading} />
          <ModelAnalysis   result={result} />
        </div>
      </div>

      <footer className={styles.footer}>
        Developed for AI Internship | Powered by TensorFlow &amp; FastAPI
      </footer>
    </div>
  );
}
