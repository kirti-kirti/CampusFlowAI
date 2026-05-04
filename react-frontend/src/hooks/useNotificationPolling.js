import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';

const useNotificationPolling = (user) => {
  const lastNotifIdRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let intervalId;

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => b.id - a.id);
          const maxId = sorted[0].id;
          if (lastNotifIdRef.current === null) {
            lastNotifIdRef.current = maxId;
          } else if (maxId > lastNotifIdRef.current) {
            const newNotifs = sorted.filter(n => n.id > lastNotifIdRef.current);
            newNotifs.forEach(n => {
              toast.info(`🔔 ${n.title}`, { position: 'top-right', autoClose: 5000, theme: 'light' });
            });
            lastNotifIdRef.current = maxId;
          }
        }
      } catch (err) {
        // Stop polling on auth errors — token expired or logged out
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearInterval(intervalId);
        }
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 5 seconds
    intervalId = setInterval(fetchNotifications, 5000);

    return () => clearInterval(intervalId);
  }, [user]);
};

export default useNotificationPolling;
