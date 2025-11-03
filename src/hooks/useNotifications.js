import { useState, useEffect } from 'react';

/**
 * 알림 기능을 관리하는 커스텀 훅
 */
export const useNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    } else if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '🍅',
        badge: '🍅',
        tag: 'minit-timer'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  return {
    notificationPermission,
    sendNotification
  };
};

