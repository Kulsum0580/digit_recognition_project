import React from 'react';
import styles from './ModelAnalysis.module.css';

export function ModelAnalysis({ result }) {
  const probs  = result?.probabilities ?? new Array(10).fill(0);
  const winner = result?.digit ?? -1;

  return (
    <div className={styles.panel}>
      <p className={styles.title}>Model Analysis</p>
      <div className={styles.grid}>
        {probs.map((p, i) => {
          const pct = Math.round(p * 100);
          return (
            <div className={styles.row} key={i}>
              <span className={styles.label}>{i}</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${i === winner ? styles.highlight : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.pct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
