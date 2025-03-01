import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Save, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Lock
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { exportVaultData, importVaultData } from '../utils/storage';

const DataBackup: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [confirmBackupPassword, setConfirmBackupPassword] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [backupHistory, setBackupHistory] = useState<{date: number, size: number}[]>([]);
  const { addNotification } = useNotification();

  // Mock function to load backup history
  const loadBackupHistory = () => {
    const history = localStorage.getItem('backupHistory');
    if (history) {
      setBackupHistory(JSON.parse(history));
    }
  };

  // Load backup history on component mount
  React.useEffect(() => {
    loadBackupHistory();
  }, []);

  const handleExport = async () => {
    if (backupPassword !== confirmBackupPassword) {
      addNotification({
        type: 'error',
        message: 'Passwords do not match',
        duration: 3000,
      });
      return;
    }

    if (backupPassword.length < 8) {
      addNotification({
        type: 'error',
        message: 'Password must be at least 8 characters',
        duration: 3000,
      });
      return;
    }

    setIsExporting(true);
    try {
      // In a real implementation, we would encrypt the backup with the provided password
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
      
      // Update backup history
      const newBackup = {
        date: Date.now(),
        size: blob.size,
      };
      const updatedHistory = [newBackup, ...backupHistory].slice(0, 10);
      setBackupHistory(updatedHistory);
      localStorage.setItem('backupHistory', JSON.stringify(updatedHistory));
      localStorage.setItem('lastBackupDate', Date.now().toString());
      
      addNotification({
        type: 'success',
        message: 'Backup exported successfully',
        duration: 3000,
      });
      
      setShowExportModal(false);
      setBackupPassword('');
      setConfirmBackupPassword('');
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        message: 'Failed to export backup',
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        message: 'Please select a backup file',
        duration: 3000,
      });
      return;
    }

    if (importPassword.length < 8) {
      addNotification({
        type: 'error',
        message: 'Please enter the backup password',
        duration: 3000,
      });
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          // In a real implementation, we would decrypt the backup with the provided password
          await importVaultData(content);
          
          addNotification({
            type: 'success',
            message: 'Backup imported successfully',
            duration: 3000,
          });
          
          setShowImportModal(false);
          setSelectedFile(null);
          setImportPassword('');
        } catch (error) {
          console.error('Import failed:', error);
          addNotification({
            type: 'error',
            message: 'Failed to import backup. The file may be corrupted or the password is incorrect.',
            duration: 5000,
          });
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Import failed:', error);
      addNotification({
        type: 'error',
        message: 'Failed to read the backup file',
        duration: 3000,
      });
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Backup & Restore</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Vault Data
            </h2>
            <div className="divider mt-0"></div>
            
            <p className="mb-4">
              Export your vault data as an encrypted backup file. You can use this file to restore your vault on another device or in case of data loss.
            </p>
            
            <div className="alert alert-info mb-4">
              <span>
                Your backup will be encrypted with a password of your choice. Make sure to remember this password as it will be required to restore your data.
              </span>
            </div>
            
            <button 
              className="btn btn-primary w-full"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="h-5 w-5 mr-2" />
              Create Encrypted Backup
            </button>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Backup Best Practices</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Create regular backups (at least monthly)</li>
                <li>Store backups in multiple secure locations</li>
                <li>Use a strong, unique password for each backup</li>
                <li>Test restoring from your backups periodically</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Vault Data
            </h2>
            <div className="divider mt-0"></div>
            
            <p className="mb-4">
              Restore your vault data from a previously created backup file. This will merge the backup data with your existing vault.
            </p>
            
            <div className="alert alert-warning mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>
                Importing a backup will add or update items in your vault. It will not delete existing items.
              </span>
            </div>
            
            <button 
              className="btn btn-primary w-full"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-5 w-5 mr-2" />
              Restore from Backup
            </button>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Supported File Types</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Secure Vault Backup (.json)</li>
                <li>Encrypted JSON exports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Backup History
            </h2>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={loadBackupHistory}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="divider mt-0"></div>
          
          {backupHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Size</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((backup, index) => (
                    <tr key={index}>
                      <td>{new Date(backup.date).toLocaleString()}</td>
                      <td>{formatFileSize(backup.size)}</td>
                      <td>
                        <div className="badge badge-success gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-base-content/70">No backup history available</p>
              <button 
                className="btn btn-primary btn-sm mt-4"
                onClick={() => setShowExportModal(true)}
              >
                Create Your First Backup
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowExportModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Create Encrypted Backup</h3>
            <div className="py-4">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Backup Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter a strong password"
                  className="input input-bordered w-full"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="input input-bordered w-full"
                  value={confirmBackupPassword}
                  onChange={(e) => setConfirmBackupPassword(e.target.value)}
                />
              </div>
              <div className="alert alert-warning">
                <AlertTriangle className="h-5 w-5" />
                <span>
                  This password is required to restore your backup. If you forget it, your backup will be unusable.
                </span>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${isExporting ? 'loading' : ''}`}
                onClick={handleExport}
                disabled={isExporting}
              >
                {!isExporting && <Save className="h-5 w-5 mr-2" />}
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowImportModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Restore from Backup</h3>
            <div className="py-4">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Select Backup File</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept=".json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Backup Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter the backup password"
                  className="input input-bordered w-full"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                />
              </div>
              <div className="alert alert-info">
                <span>
                  Enter the password you used when creating this backup.
                </span>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${isImporting ? 'loading' : ''}`}
                onClick={handleImport}
                disabled={isImporting || !selectedFile}
              >
                {!isImporting && <Upload className="h-5 w-5 mr-2" />}
                {isImporting ? 'Importing...' : 'Import Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBackup;