import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast toast-top toast-end z-50">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`alert ${
            notification.type === 'success' ? 'alert-success' :
            notification.type === 'error' ? 'alert-error' :
            notification.type === 'warning' ? 'alert-warning' :
            'alert-info'
          } shadow-lg`}
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              {notification.type === 'success' && <CheckCircle className="h-6 w-6" />}
              {notification.type === 'error' && <XCircle className="h-6 w-6" />}
              {notification.type === 'warning' && <AlertCircle className="h-6 w-6" />}
              {notification.type === 'info' && <Info className="h-6 w-6" />}
              <span>{notification.message}</span>
            </div>
            <button 
              className="btn btn-ghost btn-xs" 
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;