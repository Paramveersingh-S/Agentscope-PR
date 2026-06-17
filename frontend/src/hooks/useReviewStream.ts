import { useState, useEffect } from 'react';
import { PRReview } from '@/types';

export function useReviewStream(reviewId: string, initialData: PRReview | null) {
  const [review, setReview] = useState<PRReview | null>(initialData);

  useEffect(() => {
    if (!reviewId) return;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001";
    const ws = new WebSocket(`${WS_URL}/api/v1/reviews/${reviewId}/stream`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'agent_status_update') {
          setReview((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              agent_runs: prev.agent_runs.map((r) => 
                r.agent_name === message.data.agent_name ? { ...r, ...message.data } : r
              )
            };
          });
        } else if (message.type === 'new_finding') {
          setReview((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              findings: [...prev.findings, message.data]
            };
          });
        } else if (message.type === 'review_completed') {
          setReview((prev) => {
            if (!prev) return prev;
            return { ...prev, status: 'completed', overall_score: message.data.overall_score };
          });
        }
      } catch (err) {
        console.error("WebSocket message parse error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [reviewId]);

  return review;
}
