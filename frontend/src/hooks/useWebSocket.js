// // src/hooks/useWebSocket.js
// import { useEffect, useRef, useCallback } from "react";

// export default function useWebSocket(baseUrl, onMessage) {
//     const socketRef = useRef(null);

//     // Funkcja do nawiązywania połączenia
//     const connect = useCallback(() => {
//         if (!baseUrl) {
//             console.warn("⚠️ Brak adresu URL dla WebSocket");
//             return;
//         }

//         // Jeśli już istnieje aktywne połączenie, nie twórz nowego
//         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//             console.log("✅ Połączenie WebSocket jest już aktywne.");
//             return;
//         }

//         const token = localStorage.getItem("access_token");
//         if (!token) {
//             console.warn("⚠️ Nie znaleziono tokenu dostępu");
//             return;
//         }

//         try {
//             const url = `${baseUrl}?token=${token}`;
//             console.log("🔌 Nawiązywanie połączenia z WebSocket:", url);

//             socketRef.current = new WebSocket(url);

//             socketRef.current.onopen = () => {
//                 console.log("✅ Połączenie WebSocket nawiązane");
//             };

//             socketRef.current.onmessage = (event) => {
//                 try {
//                     const data = JSON.parse(event.data);
//                     onMessage?.(data);
//                 } catch (err) {
//                     console.error("❌ Błąd parsowania wiadomości:", err);
//                 }
//             };

//             socketRef.current.onclose = (event) => {
//                 console.warn("⚠️ Połączenie WebSocket zostało zamknięte:", event.code, event.reason);
//             };

//             socketRef.current.onerror = (error) => {
//                 console.error("❌ Błąd WebSocket:", error);
//             };
//         } catch (err) {
//             console.error("❌ Nie udało się nawiązać połączenia WebSocket:", err);
//         }
//     }, [baseUrl, onMessage]);

//     // Funkcja do wysyłania wiadomości
//     const send = useCallback((message) => {
//         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//             socketRef.current.send(JSON.stringify(message));
//         } else {
//             console.warn("⚠️ Połączenie WebSocket nie jest otwarte. Nie można wysłać wiadomości.");
//         }
//     }, []);

//     // Efekt do nawiązywania połączenia przy pierwszym renderowaniu
//     useEffect(() => {
//         connect();
//     }, [connect]);

//     // Efekt do czyszczenia połączenia przy odmontowywaniu komponentu
//     useEffect(() => {
//         return () => {
//             if (socketRef.current) {
//                 console.log("🧹 Czyszczenie i zamykanie połączenia WebSocket.");
//                 socketRef.current.close();
//             }
//         };
//     }, []);

//     return { send };
// }


// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from "react";

export default function useWebSocket(baseUrl, onMessage) {
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    // 1. Walidacja URL
    if (!baseUrl) {
      return;
    }

    // 2. Sprawdzenie czy połączenie już istnieje lub jest nawiązywane
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      console.log("✅ Połączenie WebSocket jest już aktywne lub nawiązywane.");
      return;
    }

    // 3. Pobranie tokena z obu magazynów (zgodnie z axiosConfig)
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    
    if (!token) {
      console.warn("⚠️ Nie znaleziono tokenu dostępu (access_token) w storage.");
      return;
    }

    try {
      // 4. Doklejenie tokena do URL
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
        // Ignorujemy kod 1000 (normalne zamknięcie), logujemy inne
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
      // Opcjonalnie: Spróbuj połączyć ponownie, jeśli rozłączono
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          console.log("🔄 Próba ponownego połączenia...");
          connect();
      }
    }
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      // Czyścimy socket tylko jeśli URL się zmienia lub komponent jest odmontowywany
      if (socketRef.current) {
        // Sprawdzamy stan, aby nie zamykać "otwierającego się" połączenia w strict mode bez potrzeby
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