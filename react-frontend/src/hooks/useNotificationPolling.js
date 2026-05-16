import { useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { requestFcmToken, onForegroundMessage } from '../lib/firebase';

/**
 * Registers the device FCM token with the backend on login,
 * then listens for foreground push messages via Firebase.
 *
 * No polling — notifications arrive via FCM push.
 */
const useNotificationPolling = (user) => {
  useEffect(() => {
    if (!user) return;

    let unsubscribe;

    const init = async () => {
      // 1. Get FCM token and register it with the backend
      const token = await requestFcmToken();
      if (token) {
        try {
          await api.post('/auth/fcm-token', { token });
        } catch {
          // Non-fatal — push will still work if token was already registered
        }
      }

      // 2. Listen for foreground messages (app is open)
      unsubscribe = onForegroundMessage((payload) => {
        const title = payload.notification?.title || payload.data?.title || 'New Notification';
        const body  = payload.notification?.body  || payload.data?.body  || '';
        toast.info(`🔔 ${title}${body ? ': ' + body : ''}`, {
          position: 'top-right',
          autoClose: 6000,
          theme: 'light',
        });
      });
    };

    init();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user]);
};

export default useNotificationPolling;
