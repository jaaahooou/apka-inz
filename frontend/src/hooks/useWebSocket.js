import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage) => {
  const ws = useRef(null);
  // Przechowujemy najnowszą wersję funkcji onMessage w refie,
  // żeby jej zmiana nie powodowała restartu połączenia.
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // 1. Walidacja URL
    if (!url) {
        return;
    }

    // 2. Pobieranie tokenu
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
        console.warn("⚠️ Nie znaleziono tokenu dostępu. WebSocket nie może się połączyć.");
        return;
    }

    const wsUrlWithToken = `${url}?token=${token}`;

    // 3. Inicjalizacja połączenia
    const socket = new WebSocket(wsUrlWithToken);
    ws.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket połączony:', url);
    };

    socket.onmessage = (event) => {
      // DEBUG: Logowanie surowych danych
      console.log("📩 WebSocket wiadomość otrzymana:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      } catch (e) {
        console.error("Błąd parsowania wiadomości WS:", e);
      }
    };

    socket.onerror = (error) => {
         if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
            console.error('❌ Błąd WebSocket:', error);
         }
    };

    socket.onclose = (event) => {
        if (!event.wasClean) {
             console.log('🔒 WebSocket rozłączony (nieczysto)', event.code);
        } else {
             console.log('🔒 WebSocket rozłączony');
        }
    };

    // 4. Czyszczenie (Cleanup)
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
      }
    };
  }, [url]); 

  return ws.current;
};

export default useWebSocket;