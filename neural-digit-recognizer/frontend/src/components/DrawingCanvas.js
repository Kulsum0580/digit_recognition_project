import React from 'react';
import styles from './DrawingCanvas.module.css';

export function DrawingCanvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={400}
      height={400}
      aria-label="Drawing area – draw a digit here"
    />
  );
}
