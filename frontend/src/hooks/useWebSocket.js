import { useEffect, useRef, useCallback } from "react";

export default function useWebSocket(baseUrl, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage); // Przechowujemy referencję do handlera
  const reconnectTimeoutRef = useRef(null);

  // Aktualizujemy ref handlera, gdy się zmienia, bez restartowania połączenia
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    // 1. Walidacja URL
    if (!baseUrl) return;

    // 2. Pobranie tokena
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      console.warn("⚠️ Brak tokena - WebSocket nie zostanie połączony.");
      return;
    }

    // Unikamy duplikatów połączeń - jeśli socket już jest lub się łączy, nie rób nic
    if (socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
        return;
    }

    try {
      const url = `${baseUrl}?token=${token}`;
      console.log("🔌 (Re)connecting WebSocket:", baseUrl);

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket Connected");
        // Czyścimy ewentualny timeout reconnectu, jeśli połączenie się uda
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Używamy refa, aby wywołać zawsze najnowszą wersję funkcji onMessage
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error("❌ WS Parse Error:", err);
        }
      };

      ws.onclose = (event) => {
        // Kod 1000 = normalne zamknięcie (np. przy wylogowaniu). 
        // Inne kody (np. 1006) = błąd/zerwanie -> próbujemy reconnectu
        if (event.code !== 1000) {
            console.warn(`⚠️ WS Closed (Code: ${event.code}). Reconnecting in 3s...`);
            
            // Upewniamy się, że nie ma już zaplanowanego reconnectu
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000);
        } else {
            console.log("🔒 WS Closed normally.");
        }
      };

      ws.onerror = (error) => {
        // Ignorujemy błędy, jeśli socket jest w trakcie zamykania (to normalne w React Strict Mode)
        if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
            console.error("❌ WS Error:", error);
        }
      };
      
    } catch (err) {
      console.error("❌ WS Setup Error:", err);
    }
  }, [baseUrl]); // Usunęliśmy onMessage z zależności, aby nie powodował reconnectów

  useEffect(() => {
    connect();

    return () => {
      // Czyścimy timeout reconnectu przy odmontowaniu komponentu
      if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
      }
      
      // Zamykamy socket przy odmontowaniu
      if (socketRef.current) {
        console.log("🧹 Cleaning up WebSocket");
        // Zamykamy z kodem 1000, aby onclose wiedział, że to celowe działanie
        socketRef.current.close(1000, "Component Unmounted");
        socketRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ Cannot send message: WebSocket not open");
    }
  }, []);

  return { send };
}