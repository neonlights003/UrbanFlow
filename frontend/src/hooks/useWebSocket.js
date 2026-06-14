import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(onMessage) {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket("ws://localhost:8000/ws");

      ws.current.onopen = () => {
        setConnected(true);
        console.log("[WS] Connected");
      };

      ws.current.onclose = () => {
        setConnected(false);
        console.log("[WS] Disconnected. Reconnecting in 3s...");
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (e) => {
        console.error("[WS] Error:", e);
        ws.current.close();
      };

      ws.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          onMessageRef.current(msg.type, msg.data);
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };
    } catch (err) {
      console.error("[WS] Connection failed:", err);
      setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [connect]);

  return connected;
}
