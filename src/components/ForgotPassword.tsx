import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import useWeb3Forms from '@web3forms/react';

const ForgotPassword: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { addNotification } = useNotification();

  const STATIC_RESET_TOKEN = 'FKU69$eX';
  const DEFAULT_EMAIL = 'securevault@example.com';

  const { submit } = useWeb3Forms({
    access_key: 'c4606a75-a3cb-4e95-976c-e01f6345091f',
    settings: {
      from_name: 'Secure Vault',
      subject: 'Password Reset Request',
    },
    onSuccess: (message) => {
      addNotification({
        type: 'success',
        message: 'Reset token has been sent to your secure inbox',
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Failed to send reset token:', error);
    }
  });

  useEffect(() => {
    const sendResetToken = async () => {
      setLoading(true);
      try {
        // Show token immediately
        setShowToken(true);

        // Send to Web3Forms
        await submit({
          email: DEFAULT_EMAIL,
          message: `
Secure Vault - Password Reset Request

Your password reset token is: ${STATIC_RESET_TOKEN}

This token will expire in 1 hour.

If you did not request this reset, please ignore this message.

Best regards,
Secure Vault Team
          `,
        });

        addNotification({
          type: 'info',
          message: 'Your reset token is shown below. Keep it safe!',
          duration: 5000,
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to process reset request. Please try again.',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    sendResetToken();
  }, []);

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Reset Password</h3>
        
        {showToken ? (
          <div className="alert alert-success">
            <Info className="h-5 w-5" />
            <div>
              <p className="font-bold">Your Reset Token:</p>
              <p className="font-mono text-lg">{STATIC_RESET_TOKEN}</p>
              <p className="text-sm mt-2">This token has been sent to your secure inbox.</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;