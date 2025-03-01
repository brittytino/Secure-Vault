import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Database, 
  Key, 
  UserCircle, 
  Menu, 
  X, 
  FileText, 
  Lock, 
  AlertTriangle,
  Download,
  Users,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isAuthenticated && location.pathname === '/') {
    return null; // Don't show navbar on login page
  }

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link to="/dashboard" className="btn btn-ghost text-xl">
            <Shield className="h-6 w-6 mr-2" />
            <span className="font-bold">SecureVault</span>
          </Link>
        </div>
        
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle mr-2">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        {/* Mobile menu button */}
        <div className="flex-none md:hidden">
          <button className="btn btn-square btn-ghost" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="flex-none hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                <Database className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/vault" className={location.pathname === '/vault' ? 'active' : ''}>
                <Key className="h-5 w-5" />
                Vault
              </Link>
            </li>
            <li>
              <Link to="/secure-notes" className={location.pathname === '/secure-notes' ? 'active' : ''}>
                <FileText className="h-5 w-5" />
                Notes
              </Link>
            </li>
            <li>
              <Link to="/password-generator" className={location.pathname === '/password-generator' ? 'active' : ''}>
                <Lock className="h-5 w-5" />
                Generator
              </Link>
            </li>
            <li>
              <details>
                <summary>
                  <Shield className="h-5 w-5" />
                  Security
                </summary>
                <ul className="p-2 bg-base-100 z-10">
                  <li>
                    <Link to="/security-analyzer" className={location.pathname === '/security-analyzer' ? 'active' : ''}>
                      <AlertTriangle className="h-5 w-5" />
                      Security Check
                    </Link>
                  </li>
                  <li>
                    <Link to="/data-backup" className={location.pathname === '/data-backup' ? 'active' : ''}>
                      <Download className="h-5 w-5" />
                      Backup & Restore
                    </Link>
                  </li>
                  <li>
                    <Link to="/emergency-access" className={location.pathname === '/emergency-access' ? 'active' : ''}>
                      <Users className="h-5 w-5" />
                      Emergency Access
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
                <UserCircle className="h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <button onClick={logout} className="text-error">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-base-100 shadow-lg z-50">
          <ul className="menu menu-compact p-2">
            <li>
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Database className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/vault" 
                className={location.pathname === '/vault' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Key className="h-5 w-5" />
                Vault
              </Link>
            </li>
            <li>
              <Link 
                to="/secure-notes" 
                className={location.pathname === '/secure-notes' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Notes
              </Link>
            </li>
            <li>
              <Link 
                to="/password-generator" 
                className={location.pathname === '/password-generator' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Lock className="h-5 w-5" />
                Generator
              </Link>
            </li>
            <li className="menu-title">
              <span>Security</span>
            </li>
            <li>
              <Link 
                to="/security-analyzer" 
                className={location.pathname === '/security-analyzer' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <AlertTriangle className="h-5 w-5" />
                Security Check
              </Link>
            </li>
            <li>
              <Link 
                to="/data-backup" 
                className={location.pathname === '/data-backup' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Download className="h-5 w-5" />
                Backup & Restore
              </Link>
            </li>
            <li>
              <Link 
                to="/emergency-access" 
                className={location.pathname === '/emergency-access' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                Emergency Access
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={location.pathname === '/settings' ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircle className="h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }} 
                className="text-error"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;