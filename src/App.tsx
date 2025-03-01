import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shield, Database, Key, UserCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VaultManager from './pages/VaultManager';
import Settings from './pages/Settings';
import PasswordGenerator from './pages/PasswordGenerator';
import SecurityAnalyzer from './pages/SecurityAnalyzer';
import DataBackup from './pages/DataBackup';
import EmergencyAccess from './pages/EmergencyAccess';
import SecureNotes from './pages/SecureNotes';
import { AuthProvider } from './contexts/AuthContext';
import { CryptoProvider } from './contexts/CryptoContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineAlert from './components/OfflineAlert';
import NotificationCenter from './components/NotificationCenter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CryptoProvider>
          <DataProvider>
            <ThemeProvider>
              <NotificationProvider>
                <div className="min-h-screen bg-base-200 flex flex-col">
                  <OfflineAlert />
                  <NotificationCenter />
                  <Navbar />
                  <div className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vault" 
                        element={
                          <ProtectedRoute>
                            <VaultManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/password-generator" 
                        element={
                          <ProtectedRoute>
                            <PasswordGenerator />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/security-analyzer" 
                        element={
                          <ProtectedRoute>
                            <SecurityAnalyzer />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/data-backup" 
                        element={
                          <ProtectedRoute>
                            <DataBackup />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/emergency-access" 
                        element={
                          <ProtectedRoute>
                            <EmergencyAccess />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/secure-notes" 
                        element={
                          <ProtectedRoute>
                            <SecureNotes />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </div>
                  <footer className="footer footer-center p-4 bg-base-300 text-base-content">
                    <div>
                      <p>Secure Offline Vault - All data stored locally</p>
                    </div>
                  </footer>
                </div>
              </NotificationProvider>
            </ThemeProvider>
          </DataProvider>
        </CryptoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;