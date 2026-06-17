import { useEffect, useRef } from 'react';
import { useReviewStore, AgentStatus, Finding } from '@/store/useReviewStore';

export function useLiveReview(reviewId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const { setIsConnected, updateAgentStatus, addFinding, resetReview } = useReviewStore();

  useEffect(() => {
    if (!reviewId) return;

    resetReview();

    const connect = () => {
      // Connect to FastAPI WebSocket backend
      ws.current = new WebSocket(`ws://localhost:8001/api/v1/reviews/${reviewId}/stream`);

      ws.current.onopen = () => {
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'agent_status') {
            updateAgentStatus(data.agent_name, data.status as AgentStatus);
          } else if (data.type === 'finding') {
            addFinding(data.finding as Finding);
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Optional: Implement reconnect logic here
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [reviewId, setIsConnected, updateAgentStatus, addFinding, resetReview]);

  return { isConnected: useReviewStore(state => state.isConnected) };
}
