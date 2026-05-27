import React, { useState } from 'react';
import { MaintenanceProvider, useMaintenance } from './context/MaintenanceContext';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/views/DashboardView';
import { ControlPanelView } from './components/views/ControlPanelView';
import { HistoryView } from './components/views/HistoryView';
import { CalendarView } from './components/views/CalendarView';
import { CategoriesView } from './components/views/CategoriesView';
import { LoginView } from './components/views/LoginView';

function AppContent() {
  const { isAuthenticated, role } = useMaintenance();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-300">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'tasks' && <ControlPanelView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'categories' && role === 'Administrator' && <CategoriesView />}
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <MaintenanceProvider>
      <AppContent />
    </MaintenanceProvider>
  );
}
