import React from 'react';
import styles from './PredictionPanel.module.css';

export function PredictionPanel({ result, loading }) {
  const digit      = result?.digit      ?? null;
  const confidence = result?.confidence ?? 0;
  const pct        = Math.round(confidence * 100);

  return (
    <div className={styles.panel}>
      <p className={styles.title}>Prediction</p>

      <div className={`${styles.value} ${digit === null ? styles.empty : ''}`}>
        {loading ? <span className={styles.spinner} /> : digit !== null ? digit : '?'}
      </div>

      <div className={styles.confRow}>
        <span>Confidence</span>
        <span>{pct}%</span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
