import React, { createContext, useContext, useState, useEffect } from 'react';
import toast, { Toaster, Toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotification = { ...notification, id };

    // Show toast notification
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-success" />}
                {notification.type === 'error' && <XCircle className="h-5 w-5 text-error" />}
                {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
                {notification.type === 'info' && <Info className="h-5 w-5 text-info" />}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-base-content">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-base-300">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-base-content hover:text-base-content/70 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      { duration: notification.duration || 5000 }
    );

    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <Toaster position="top-right" />
    </NotificationContext.Provider>
  );
};