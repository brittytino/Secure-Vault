import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Info 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, isLoading, login, initialize } = useAuth();
  const { addNotification } = useNotification();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Recovery phrase for new vault setup
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(true);
  const [recoveryPhraseConfirmed, setRecoveryPhraseConfirmed] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Generate recovery phrase
  useEffect(() => {
    const generateRecoveryPhrase = () => {
      const words = [
        'apple', 'banana', 'orange', 'grape', 'lemon', 'peach', 'mango', 'kiwi',
        'plum', 'cherry', 'melon', 'berry', 'pear', 'apricot', 'fig', 'lime',
        'coconut', 'avocado', 'olive', 'peanut', 'walnut', 'almond', 'cashew', 'pistachio'
      ];
      
      const randomWords = [];
      for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        randomWords.push(words[randomIndex]);
      }
      
      return randomWords.join(' ');
    };
    
    setRecoveryPhrase(generateRecoveryPhrase());
  }, []);

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    if (!password) return false;
    
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasNumber && hasUppercase && hasSpecial && isLongEnough;
  };

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with at least one number, one uppercase letter, and one special character');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStep(2);
  };

  const handleConfirmRecoveryPhrase = () => {
    setRecoveryPhraseConfirmed(true);
    setStep(3);
  };

  const handleFinalizeVaultCreation = async () => {
    setLoading(true);
    try {
      // Store the recovery phrase securely (in a real app, this would be encrypted)
      localStorage.setItem('recoveryPhraseHash', await hashString(recoveryPhrase));
      
      const success = await initialize(password);
      if (success) {
        // After initialization, log in automatically
        await login(password);
        addNotification({
          type: 'success',
          message: 'Vault created successfully!',
          duration: 5000
        });
        navigate('/dashboard');
      } else {
        setError('Failed to create vault. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(password);
      if (success) {
        addNotification({
          type: 'success',
          message: 'Login successful!',
          duration: 3000
        });
        navigate('/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simple hash function for demo purposes
  const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Render login form
  if (isInitialized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center mb-6">
              <Shield className="h-16 w-16 text-primary mb-2" />
              <h2 className="card-title text-2xl font-bold">SecureVault</h2>
              <p className="text-center text-base-content/70">
                Enter your master password to unlock your vault
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Master Password</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-square"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Unlock Vault
                </button>
              </div>
            </form>

            <div className="divider mt-6">Secure & Private</div>
            <div className="text-sm text-center text-base-content/70">
              <p>All data is encrypted and stored locally on your device.</p>
              <p>No data is ever sent to any server.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render vault creation steps
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-6">
            <Shield className="h-16 w-16 text-primary mb-2" />
            <h2 className="card-title text-2xl font-bold">SecureVault</h2>
            <p className="text-center text-base-content/70">
              Create a new secure offline vault
            </p>
          </div>

          {/* Step indicator */}
          <ul className="steps steps-horizontal w-full mb-6">
            <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Create Password</li>
            <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Recovery Phrase</li>
            <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Finalize</li>
          </ul>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCreateVault}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Master Password</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="btn btn-square"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`badge ${password.length >= 8 ? 'badge-success' : 'badge-ghost'}`}>
                      {password.length >= 8 ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      8+ characters
                    </div>
                    <div className={`badge ${/[A-Z]/.test(password) ? 'badge-success' : 'badge-ghost'}`}>
                      {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      Uppercase
                    </div>
                    <div className={`badge ${/\d/.test(password) ? 'badge-success' : 'badge-ghost'}`}>
                      {/\d/.test(password) ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      Number
                    </div>
                    <div className={`badge ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'badge-success' : 'badge-ghost'}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      Special
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="input input-bordered w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-square"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password && confirmPassword && (
                  <label className="label">
                    <span className={`label-text-alt ${password === confirmPassword ? 'text-success' : 'text-error'}`}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </label>
                )}
              </div>

              <div className="alert alert-warning mt-4">
                <AlertTriangle className="h-5 w-5" />
                <span>This password cannot be recovered. Make sure to remember it!</span>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!password || !confirmPassword || password !== confirmPassword || !validatePassword(password)}
                >
                  <Key className="h-5 w-5 mr-2" />
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <div className="alert alert-info mb-4">
                <Info className="h-5 w-5" />
                <span>Save this recovery phrase in a secure location. It can be used to recover your vault if you forget your password.</span>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recovery Phrase</span>
                </label>
                <div className="relative">
                  <textarea
                    className="textarea textarea-bordered w-full h-24 font-mono text-sm"
                    value={recoveryPhrase}
                    readOnly
                  ></textarea>
                  <button
                    type="button"
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                    onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
                  >
                    {showRecoveryPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryPhrase);
                    addNotification({
                      type: 'success',
                      message: 'Recovery phrase copied to clipboard',
                      duration: 3000
                    });
                  }}
                >
                  Copy to Clipboard
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmRecoveryPhrase}
                >
                  I've Saved It
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="alert alert-success mb-6">
                <CheckCircle className="h-5 w-5" />
                <span>You're almost done! Click the button below to create your secure vault.</span>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Security Features</span>
                </label>
                <ul className="list-disc list-inside text-sm text-base-content/70 mb-4">
                  <li>All data is encrypted with AES-256-GCM</li>
                  <li>Your master password never leaves your device</li>
                  <li>Chaff data is added to confuse potential attackers</li>
                  <li>Works offline with no internet connection required</li>
                  <li>Automatic session timeout for added security</li>
                </ul>
              </div>

              <div className="form-control mt-6">
                <button
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  onClick={handleFinalizeVaultCreation}
                  disabled={loading}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Create My Vault
                </button>
              </div>
            </div>
          )}

          {step > 1 && (
            <button
              className="btn btn-ghost btn-sm mt-4"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Back
            </button>
          )}

          <div className="divider mt-6">Secure & Private</div>
          <div className="text-sm text-center text-base-content/70">
            <p>All data is encrypted and stored locally on your device.</p>
            <p>No data is ever sent to any server.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;