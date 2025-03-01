import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineAlert: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="bg-warning text-warning-content py-2 px-4 text-center">
      <div className="flex items-center justify-center">
        <WifiOff className="h-4 w-4 mr-2" />
        <span>You are currently offline. All features will continue to work.</span>
      </div>
    </div>
  );
};

export default OfflineAlert;