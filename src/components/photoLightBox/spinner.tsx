import React from 'react';
import styles from './spinner.module.css';

export default function Spinner() {
  return (
    <div className={styles.spinner}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#ccc" strokeWidth="4" fill="none" />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="#0070f3"
          strokeWidth="4"
          fill="none"
          strokeDasharray="90"
          strokeDashoffset="60"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 20 20"
            to="360 20 20"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
