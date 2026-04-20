import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : window.location.origin;

    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('[SOCKET] Connected');
      newSocket.emit('join', user.id || user._id);
    });

    newSocket.on('notification', (notif) => {
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/icons/icon-192x192.png'
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const resetUnreadCount = () => setUnreadCount(0);
  const setCount = (count) => setUnreadCount(count);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, resetUnreadCount, setCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
