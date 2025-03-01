import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Sliders, AlertTriangle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [copied, setCopied] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const { addNotification } = useNotification();

  // Generate password on component mount and when options change
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length contribution (up to 40%)
    strength += Math.min(40, (password.length / 20) * 40);
    
    // Character set contribution (up to 40%)
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    const charSetCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;
    strength += charSetCount * 10;
    
    // Variety contribution (up to 20%)
    const uniqueChars = new Set(password.split('')).size;
    const uniqueRatio = uniqueChars / password.length;
    strength += uniqueRatio * 20;
    
    setPasswordStrength(Math.min(100, Math.round(strength)));
  }, [password]);

  const generatePassword = () => {
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      addNotification({
        type: 'warning',
        message: 'Please select at least one character type',
        duration: 3000
      });
      return;
    }

    let charset = '';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    // Similar characters to exclude if option is selected
    const similarChars = 'il1Lo0O';
    // Ambiguous characters to exclude if option is selected
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

    if (includeUppercase) charset += uppercaseChars;
    if (includeLowercase) charset += lowercaseChars;
    if (includeNumbers) charset += numberChars;
    if (includeSymbols) charset += symbolChars;

    if (excludeSimilar) {
      for (const char of similarChars) {
        charset = charset.replace(new RegExp(char, 'g'), '');
      }
    }

    if (excludeAmbiguous) {
      for (const char of ambiguousChars) {
        charset = charset.replace(new RegExp('\\' + char, 'g'), '');
      }
    }

    let newPassword = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(randomValues[i] % charset.length);
    }

    // Ensure at least one character from each selected type
    let finalPassword = newPassword;
    
    if (includeUppercase && !/[A-Z]/.test(finalPassword)) {
      const pos = Math.floor(Math.random() * length);
      const randomChar = uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
      finalPassword = finalPassword.substring(0, pos) + randomChar + finalPassword.substring(pos + 1);
    }
    
    if (includeLowercase && !/[a-z]/.test(finalPassword)) {
      const pos = Math.floor(Math.random() * length);
      const randomChar = lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
      finalPassword = finalPassword.substring(0, pos) + randomChar + finalPassword.substring(pos + 1);
    }
    
    if (includeNumbers && !/[0-9]/.test(finalPassword)) {
      const pos = Math.floor(Math.random() * length);
      const randomChar = numberChars.charAt(Math.floor(Math.random() * numberChars.length));
      finalPassword = finalPassword.substring(0, pos) + randomChar + finalPassword.substring(pos + 1);
    }
    
    if (includeSymbols && !/[^A-Za-z0-9]/.test(finalPassword)) {
      const pos = Math.floor(Math.random() * length);
      const randomChar = symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
      finalPassword = finalPassword.substring(0, pos) + randomChar + finalPassword.substring(pos + 1);
    }

    setPassword(finalPassword);
    setCopied(false);
    
    // Add to history (keep last 10)
    setPasswordHistory(prev => {
      const newHistory = [finalPassword, ...prev];
      return newHistory.slice(0, 10);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    addNotification({
      type: 'success',
      message: 'Password copied to clipboard',
      duration: 2000
    });
    
    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-error';
    if (passwordStrength < 60) return 'bg-warning';
    if (passwordStrength < 80) return 'bg-info';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Password Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex justify-between">
              <span>Generate Secure Password</span>
              <Sliders className="h-5 w-5" />
            </h2>
            <div className="divider mt-0"></div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password Length</span>
                <span className="label-text-alt">{length} characters</span>
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="range range-primary"
                step="1"
              />
              <div className="flex justify-between text-xs px-2 mt-1">
                <span>8</span>
                <span>16</span>
                <span>32</span>
                <span>48</span>
                <span>64</span>
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Character Types</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                    />
                    <span className="label-text">Uppercase (A-Z)</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                    />
                    <span className="label-text">Lowercase (a-z)</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                    />
                    <span className="label-text">Numbers (0-9)</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                    <span className="label-text">Symbols (!@#$%)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Exclusions</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={excludeSimilar}
                      onChange={(e) => setExcludeSimilar(e.target.checked)}
                    />
                    <span className="label-text">Similar characters (i, l, 1, L, o, 0, O)</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    />
                    <span className="label-text">Ambiguous characters ({ }[ ]( )/ \ ' " ` ~)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                className="btn btn-primary w-full"
                onClick={generatePassword}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Generate New Password
              </button>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Generated Password</h2>
            <div className="divider mt-0"></div>
            
            <div className="bg-base-200 p-4 rounded-lg font-mono text-lg break-all">
              {password}
            </div>
            
            <div className="mt-4">
              <label className="label">
                <span className="label-text">Password Strength</span>
                <span className="label-text-alt">{getStrengthText()}</span>
              </label>
              <progress
                className={`progress ${getStrengthColor()} w-full`}
                value={passwordStrength}
                max="100"
              ></progress>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                className="btn btn-primary flex-1"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : (
                  <Copy className="h-5 w-5 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                className="btn btn-outline"
                onClick={generatePassword}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            
            {passwordStrength < 60 && (
              <div className="alert alert-warning mt-4">
                <AlertTriangle className="h-5 w-5" />
                <span>This password may not be strong enough for sensitive accounts.</span>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Password History</h3>
              <div className="overflow-y-auto max-h-48">
                {passwordHistory.length > 0 ? (
                  <ul className="menu bg-base-200 rounded-box">
                    {passwordHistory.map((historyItem, index) => (
                      <li key={index}>
                        <a
                          className="font-mono text-xs truncate"
                          onClick={() => {
                            navigator.clipboard.writeText(historyItem);
                            addNotification({
                              type: 'success',
                              message: 'Password copied to clipboard',
                              duration: 2000
                            });
                          }}
                        >
                          {historyItem}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-base-content/70">No history yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">Password Security Tips</h2>
          <div className="divider mt-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Do's</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Use a different password for each account</li>
                <li>Make passwords at least 12 characters long</li>
                <li>Use a mix of character types</li>
                <li>Consider using a passphrase for important accounts</li>
                <li>Change passwords regularly for sensitive accounts</li>
                <li>Use this vault to securely store your passwords</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Don'ts</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Don't use personal information in passwords</li>
                <li>Don't use common words or patterns</li>
                <li>Don't share passwords with others</li>
                <li>Don't write passwords on paper or in unsecured files</li>
                <li>Don't use the same password across multiple sites</li>
                <li>Don't use passwords that have been in data breaches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;