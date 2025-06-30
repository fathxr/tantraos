import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ClientsManager } from './components/Clients/ClientsManager';
import { AppointmentsManager } from './components/Appointments/AppointmentsManager';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { MessagesHub } from './components/Messages/MessagesHub';
import { SecurityCenter } from './components/Security/SecurityCenter';
import { SettingsManager } from './components/Settings/SettingsManager';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsManager />;
      case 'appointments':
        return <AppointmentsManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'messages':
        return <MessagesHub />;
      case 'security':
        return <SecurityCenter />;
      case 'settings':
        return <SettingsManager />;
      case 'staff':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Staff management features coming soon...</p>
          </div>
        );
      case 'services':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Services management features coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            language={language}
            onLanguageChange={setLanguage}
          />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;