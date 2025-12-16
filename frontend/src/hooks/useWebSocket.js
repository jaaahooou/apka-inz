import { useEffect, useRef, useCallback } from "react";

export default function useWebSocket(baseUrl, onMessage) {
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (!baseUrl) {
      return;
    }

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      console.log("✅ Połączenie WebSocket jest już aktywne lub nawiązywane.");
      return;
    }

    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    
    if (!token) {
      console.warn("⚠️ Nie znaleziono tokenu dostępu (access_token) w storage.");
      return;
    }

    try {
      const url = `${baseUrl}?token=${token}`;
      console.log("🔌 Nawiązywanie połączenia z WebSocket:", url);

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Połączenie WebSocket nawiązane");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ Błąd parsowania wiadomości:", err);
        }
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
            console.warn(`⚠️ Połączenie WebSocket zamknięte (Kod: ${event.code}):`, event.reason);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Błąd WebSocket:", error);
      };
      
    } catch (err) {
      console.error("❌ Nie udało się utworzyć obiektu WebSocket:", err);
    }
  }, [baseUrl, onMessage]);

  const send = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ Połączenie WebSocket nie jest otwarte. Stan:", socketRef.current?.readyState);
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          console.log("🔄 Próba ponownego połączenia...");
          connect();
      }
    }
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
             console.log("🧹 Zamykanie połączenia WebSocket przy odmontowaniu/zmianie URL.");
             socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [connect]);

  return { send };
}