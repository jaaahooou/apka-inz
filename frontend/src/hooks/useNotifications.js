import { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';
import useWebSocket from './useWebSocket';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Funkcja pomocnicza do odtwarzania dźwięku
  const playNotificationSound = () => {
    // Sprawdź w localStorage, czy dźwięk jest włączony (domyślnie true, jeśli brak klucza)
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    
    if (soundEnabled) {
      // Upewnij się, że masz plik notification.mp3 w folderze public/sounds/
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5; // Opcjonalnie: ustawienie głośności
      audio.play().catch((error) => {
        // Przeglądarki mogą blokować autoplay, jeśli użytkownik nie wszedł w interakcję ze stroną
        console.warn("Nie udało się odtworzyć dźwięku powiadomienia:", error);
      });
    }
  };

  // 1. Pobieranie wstępnych danych (REST API)
  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        API.get('/court/notifications/'),
        API.get('/court/notifications/unread-count/')
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data.unread_count);
    } catch (error) {
      console.error("Błąd pobierania powiadomień:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Obsługa WebSocket (Real-time)
  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'notification') {
      const newNotif = message.data;
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);

      // ODTWÓRZ DŹWIĘK przy nadejściu nowego powiadomienia
      playNotificationSound();
    }
  }, []);

  const { send } = useWebSocket('ws://127.0.0.1:8000/ws/notifications/', handleWebSocketMessage);

  // 3. Oznaczanie jako przeczytane
  const markAsRead = async (id) => {
    try {
      await API.put(`/court/notifications/${id}/read/`);
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Błąd oznaczania powiadomienia:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/court/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Błąd oznaczania wszystkich:", error);
    }
  };

  // 4. Usuwanie powiadomienia
  const deleteNotification = async (id) => {
    try {
        await API.delete(`/court/notifications/${id}/delete/`);
        
        setNotifications(prev => {
            // Znajdź usuwane powiadomienie
            const target = prev.find(n => n.id === id);
            
            // Jeśli usuwamy nieprzeczytane, zmniejsz licznik
            if (target && !target.is_read) {
                setUnreadCount(current => Math.max(0, current - 1));
            }
            
            // Zwróć nową listę bez tego elementu
            return prev.filter(n => n.id !== id);
        });
    } catch (error) {
        console.error("Błąd usuwania powiadomienia:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};

export default useNotifications;