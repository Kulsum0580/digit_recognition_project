import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * usePredict
 * Calls POST /predict with a base64 image.
 * Returns { predict, result, loading, error, reset }
 */
export function usePredict() {
  const [result, setResult]   = useState(null);   // { digit, confidence, probabilities }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const predict = useCallback(async (imageDataUrl) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { predict, result, loading, error, reset };
}
