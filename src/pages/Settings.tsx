import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Save,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCrypto } from '../contexts/CryptoContext';
import { exportVaultData, importVaultData, clearAllData, getAuditLogs } from '../utils/storage';

interface AuditLog {
  id: string;
  type: string;
  timestamp: number;
  details: any;
}

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const { chaffRatio, setChaffRatio } = useCrypto();
  const [showResetModal, setShowResetModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await getAuditLogs(50);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const exportData = await exportVaultData();
      
      // Create a download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secure-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await importVaultData(content);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
          // Reload audit logs after import
          loadAuditLogs();
        } catch (error) {
          console.error('Import failed:', error);
          setError('Failed to import data. The file may be corrupted.');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import failed:', error);
      setError('Failed to read the import file');
    }
  };

  const handleReset = async () => {
    try {
      await clearAllData();
      logout();
    } catch (error) {
      console.error('Reset failed:', error);
      setError('Failed to reset the vault');
    }
  };

  const formatLogType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {exportSuccess && (
        <div className="alert alert-success mb-6">
          <span>Vault data exported successfully!</span>
        </div>
      )}

      {importSuccess && (
        <div className="alert alert-success mb-6">
          <span>Vault data imported successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </h2>
            <div className="divider mt-0"></div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Chaff Ratio</span>
                <span className="label-text-alt">{chaffRatio}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={chaffRatio}
                onChange={(e) => setChaffRatio(parseInt(e.target.value))}
                className="range range-primary"
                step="1"
              />
              <div className="flex justify-between text-xs px-2 mt-1">
                <span>Less</span>
                <span>More</span>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Higher values add more decoy data for better security but use more storage
                </span>
              </label>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Data Management</h3>
              <div className="grid grid-cols-1 gap-4">
                <button className="btn btn-outline" onClick={handleExport}>
                  <Download className="h-5 w-5 mr-2" />
                  Export Vault Data
                </button>
                
                <div className="form-control w-full">
                  <label className="btn btn-outline">
                    <Upload className="h-5 w-5 mr-2" />
                    Import Vault Data
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                </div>
                
                <button
                  className="btn btn-error"
                  onClick={() => setShowResetModal(true)}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Reset Vault
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Audit Log</h2>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={loadAuditLogs}
                disabled={isLoadingLogs}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="divider mt-0"></div>
            
            {isLoadingLogs ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : auditLogs.length > 0 ? (
              <div className="overflow-y-auto max-h-96">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Time</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div className="badge badge-outline">
                            {formatLogType(log.type)}
                          </div>
                        </td>
                        <td>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>
                          {log.details.success !== undefined ? (
                            log.details.success ? (
                              <span className="text-success">Success</span>
                            ) : (
                              <span className="text-error">Failed</span>
                            )
                          ) : log.details.error ? (
                            <span className="text-error">{log.details.error}</span>
                          ) : (
                            <span className="text-xs opacity-70">
                              {JSON.stringify(log.details).substring(0, 30)}
                              {JSON.stringify(log.details).length > 30 ? '...' : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-base-content/70">No audit logs available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowResetModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg text-error">Danger Zone</h3>
            <p className="py-4">
              Are you sure you want to reset your vault? This will permanently delete all your data and cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleReset}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Reset Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;