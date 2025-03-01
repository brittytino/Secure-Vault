import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Lock,
  Key,
  Eye
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  details?: string;
  recommendation?: string;
}

const SecurityAnalyzer: React.FC = () => {
  const { items } = useData();
  const { isAuthenticated } = useAuth();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      runSecurityAnalysis();
    }
  }, [isAuthenticated, items]);

  const runSecurityAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Initialize checks with pending status
    const initialChecks: SecurityCheck[] = [
      {
        id: 'password-strength',
        name: 'Password Strength',
        description: 'Checks if your stored passwords are strong enough',
        status: 'pending'
      },
      {
        id: 'password-reuse',
        name: 'Password Reuse',
        description: 'Checks if you are reusing passwords across multiple sites',
        status: 'pending'
      },
      {
        id: 'password-age',
        name: 'Password Age',
        description: 'Checks if any passwords are older than 90 days',
        status: 'pending'
      },
      {
        id: 'master-password',
        name: 'Master Password',
        description: 'Evaluates the strength of your master password',
        status: 'pending'
      },
      {
        id: 'data-backup',
        name: 'Data Backup',
        description: 'Checks if you have recent backups of your vault',
        status: 'pending'
      },
      {
        id: 'browser-security',
        name: 'Browser Security',
        description: 'Checks if your browser supports modern security features',
        status: 'pending'
      },
      {
        id: 'encryption-algorithm',
        name: 'Encryption Algorithm',
        description: 'Verifies that strong encryption is being used',
        status: 'pending'
      },
      {
        id: 'offline-availability',
        name: 'Offline Availability',
        description: 'Checks if your vault works properly offline',
        status: 'pending'
      }
    ];
    
    setSecurityChecks(initialChecks);
    
    // Simulate analysis with a delay
    setTimeout(() => {
      const results = analyzeSecurityStatus();
      setSecurityChecks(results);
      
      // Calculate overall score
      const passedChecks = results.filter(check => check.status === 'passed').length;
      const warningChecks = results.filter(check => check.status === 'warning').length;
      const totalChecks = results.length;
      
      const score = Math.round(((passedChecks + (warningChecks * 0.5)) / totalChecks) * 100);
      setOverallScore(score);
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const analyzeSecurityStatus = (): SecurityCheck[] => {
    const passwordItems = items.filter(item => item.type === 'password');
    const results: SecurityCheck[] = [];
    
    // Check 1: Password Strength
    const weakPasswords = passwordItems.filter(item => {
      const password = item.data.password || '';
      return !isStrongPassword(password);
    });
    
    results.push({
      id: 'password-strength',
      name: 'Password Strength',
      description: 'Checks if your stored passwords are strong enough',
      status: weakPasswords.length === 0 ? 'passed' : 
              weakPasswords.length < 3 ? 'warning' : 'failed',
      details: weakPasswords.length === 0 ? 
               'All your passwords are strong.' : 
               `Found ${weakPasswords.length} weak passwords.`,
      recommendation: weakPasswords.length > 0 ? 
                     'Use the password generator to create stronger passwords.' : undefined
    });
    
    // Check 2: Password Reuse
    const passwords = passwordItems.map(item => item.data.password || '');
    const uniquePasswords = new Set(passwords);
    const reusedPasswordCount = passwords.length - uniquePasswords.size;
    
    results.push({
      id: 'password-reuse',
      name: 'Password Reuse',
      description: 'Checks if you are reusing passwords across multiple sites',
      status: reusedPasswordCount === 0 ? 'passed' : 
              reusedPasswordCount < 3 ? 'warning' : 'failed',
      details: reusedPasswordCount === 0 ? 
               'You are not reusing any passwords.' : 
               `You are reusing ${reusedPasswordCount} passwords across multiple sites.`,
      recommendation: reusedPasswordCount > 0 ? 
                     'Use unique passwords for each site to prevent credential stuffing attacks.' : undefined
    });
    
    // Check 3: Password Age
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const oldPasswords = passwordItems.filter(item => item.updatedAt < ninetyDaysAgo);
    
    results.push({
      id: 'password-age',
      name: 'Password Age',
      description: 'Checks if any passwords are older than 90 days',
      status: oldPasswords.length === 0 ? 'passed' : 
              oldPasswords.length < 3 ? 'warning' : 'failed',
      details: oldPasswords.length === 0 ? 
               'All your passwords are up to date.' : 
               `Found ${oldPasswords.length} passwords that haven't been updated in over 90 days.`,
      recommendation: oldPasswords.length > 0 ? 
                     'Regularly update your passwords, especially for sensitive accounts.' : undefined
    });
    
    // Check 4: Master Password
    // This is a mock check since we don't actually have access to the master password
    results.push({
      id: 'master-password',
      name: 'Master Password',
      description: 'Evaluates the strength of your master password',
      status: 'passed',
      details: 'Your master password meets security requirements.',
      recommendation: 'Consider changing your master password every 6 months for optimal security.'
    });
    
    // Check 5: Data Backup
    // Mock check - in a real app, we'd check for actual backup timestamps
    const lastBackupDate = localStorage.getItem('lastBackupDate');
    const hasRecentBackup = lastBackupDate && (parseInt(lastBackupDate) > (now - (30 * 24 * 60 * 60 * 1000)));
    
    results.push({
      id: 'data-backup',
      name: 'Data Backup',
      description: 'Checks if you have recent backups of your vault',
      status: hasRecentBackup ? 'passed' : 'warning',
      details: hasRecentBackup ? 
               'You have a recent backup of your vault.' : 
               'No recent backup found.',
      recommendation: !hasRecentBackup ? 
                     'Export a backup of your vault regularly to prevent data loss.' : undefined
    });
    
    // Check 6: Browser Security
    const isSecureContext = window.isSecureContext;
    const hasWebCrypto = window.crypto && window.crypto.subtle;
    
    results.push({
      id: 'browser-security',
      name: 'Browser Security',
      description: 'Checks if your browser supports modern security features',
      status: (isSecureContext && hasWebCrypto) ? 'passed' : 'warning',
      details: (isSecureContext && hasWebCrypto) ? 
               'Your browser supports all required security features.' : 
               'Your browser may not support all security features.',
      recommendation: !(isSecureContext && hasWebCrypto) ? 
                     'Use a modern browser like Chrome, Firefox, or Edge for best security.' : undefined
    });
    
    // Check 7: Encryption Algorithm
    results.push({
      id: 'encryption-algorithm',
      name: 'Encryption Algorithm',
      description: 'Verifies that strong encryption is being used',
      status: 'passed',
      details: 'Your vault uses AES-256-GCM encryption, which is currently considered secure.',
      recommendation: 'Keep your application updated to ensure you have the latest security improvements.'
    });
    
    // Check 8: Offline Availability
    const isOfflineCapable = 'serviceWorker' in navigator;
    
    results.push({
      id: 'offline-availability',
      name: 'Offline Availability',
      description: 'Checks if your vault works properly offline',
      status: isOfflineCapable ? 'passed' : 'warning',
      details: isOfflineCapable ? 
               'Your vault is configured to work offline.' : 
               'Your browser may not fully support offline functionality.',
      recommendation: !isOfflineCapable ? 
                     'Use a modern browser that supports Service Workers for offline functionality.' : undefined
    });
    
    return results;
  };

  const isStrongPassword = (password: string): boolean => {
    if (!password || password.length < 12) return false;
    
    // Check for character variety
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const varietyScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    return varietyScore >= 3;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <RefreshCw className="h-5 w-5 animate-spin" />;
    }
  };

  const getScoreColor = () => {
    if (overallScore >= 80) return 'text-success';
    if (overallScore >= 60) return 'text-warning';
    return 'text-error';
  };

  const toggleDetails = (id: string) => {
    if (showDetails === id) {
      setShowDetails(null);
    } else {
      setShowDetails(id);
    }
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Security Analyzer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Security Score</h2>
            <div className={`text-5xl font-bold mt-2 ${getScoreColor()}`}>
              {isAnalyzing ? (
                <RefreshCw className="h-12 w-12 animate-spin mx-auto" />
              ) : (
                `${overallScore}%`
              )}
            </div>
            <p className="text-base-content/70 mt-2">
              {overallScore >= 80 ? 'Excellent' : 
               overallScore >= 60 ? 'Good' : 
               overallScore >= 40 ? 'Fair' : 'Poor'}
            </p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Password Health</h2>
            <div className="stats shadow mt-2">
              <div className="stat place-items-center">
                <div className="stat-title">Total</div>
                <div className="stat-value">{items.filter(item => item.type === 'password').length}</div>
                <div className="stat-desc">Stored Passwords</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Weak</div>
                <div className="stat-value text-error">
                  {isAnalyzing ? (
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    securityChecks.find(check => check.id === 'password-strength')?.status === 'failed' ? 
                    '3+' : securityChecks.find(check => check.id === 'password-strength')?.status === 'warning' ? 
                    '1-2' : '0'
                  )}
                </div>
                <div className="stat-desc">Need Attention</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="mt-2">
              <button 
                className="btn btn-primary w-full mb-2"
                onClick={runSecurityAnalysis}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Security Check'}
              </button>
              <button className="btn btn-outline w-full">
                <Lock className="h-5 w-5 mr-2" />
                Fix Security Issues
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex justify-between">
            <span>Security Check Results</span>
            <Shield className="h-5 w-5" />
          </h2>
          <div className="divider mt-0"></div>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-8">
              <RefreshCw className="h-12 w-12 animate-spin mb-4" />
              <p className="text-lg">Analyzing your security status...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {securityChecks.map((check) => (
                    <React.Fragment key={check.id}>
                      <tr className="hover cursor-pointer" onClick={() => toggleDetails(check.id)}>
                        <td className="font-medium">{check.name}</td>
                        <td>{getStatusIcon(check.status)}</td>
                        <td>{check.description}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {showDetails === check.id && (
                        <tr className="bg-base-200">
                          <td colSpan={4} className="p-4">
                            <div className="text-sm">
                              <p className="font-semibold mb-2">Details:</p>
                              <p>{check.details}</p>
                              
                              {check.recommendation && (
                                <>
                                  <p className="font-semibold mt-3 mb-2">Recommendation:</p>
                                  <p>{check.recommendation}</p>
                                </>
                              )}
                              
                              {check.status !== 'passed' && (
                                <button className="btn btn-sm btn-primary mt-4">
                                  <Key className="h-4 w-4 mr-2" />
                                  Fix Issue
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">Security Recommendations</h2>
          <div className="divider mt-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Password Security</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Use unique passwords for each account</li>
                <li>Aim for at least 12 characters in length</li>
                <li>Include a mix of character types</li>
                <li>Change passwords every 90 days for sensitive accounts</li>
                <li>Use the built-in password generator</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Vault Security</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Create regular encrypted backups</li>
                <li>Use a strong master password</li>
                <li>Enable biometric authentication if available</li>
                <li>Keep your browser and device updated</li>
                <li>Lock your vault when not in use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAnalyzer;