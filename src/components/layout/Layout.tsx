import React, { useState } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { 
  BarChart3, 
  Settings2, 
  ClipboardList, 
  Calendar as CalendarIcon, 
  Activity,
  Menu,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export function Layout({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) {
  const { role, logout, theme, toggleTheme } = useMaintenance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks', label: 'Control Panel', icon: Settings2 },
    { id: 'history', label: 'History', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-canvas dark:bg-canvas-dark text-text-primary dark:text-text-primary-dark">
      
      {/* Desktop Sidebar (Navy) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 flex-shrink-0 relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="ml-3 text-base font-bold tracking-tight text-white uppercase">
            Perfusion <span className="text-brand">HC</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  activeTab === tab.id 
                    ? "bg-brand text-white shadow-md shadow-brand/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-5 w-5", activeTab === tab.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="text-[10px] text-slate-500">
            <p>Version 4.2.1-Stable</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-400">System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* Top Navigation Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark z-10 shrink-0">
          
          {/* Mobile View Sidebar Toggle & Logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              className="p-2 -ml-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          {/* Spacer on Desktop so controls go right */}
          <div className="hidden md:block flex-1"></div>

          {/* Global Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 px-4 py-1.5 rounded-full border border-border dark:border-border-dark">
              <span className="text-xs font-bold text-brand dark:text-brand-light uppercase tracking-wider">
                {role}
              </span>
              <div className="w-[1px] h-4 bg-border dark:bg-border-dark"></div>
              <button
                onClick={logout}
                className="text-xs font-bold text-text-muted hover:text-rose-500 transition-colors uppercase tracking-wider flex items-center pr-1"
                title="Log Out"
              >
                Logout
              </button>
            </div>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted transition-colors">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar (Overlay) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col relative">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                   <Activity className="h-5 w-5 text-brand" />
                   <h1 className="text-sm font-bold text-white uppercase tracking-tight">Perfusion HC</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                      className={cn(
                        "flex items-center w-full gap-3 px-3 py-3 rounded-md text-sm font-medium",
                        activeTab === tab.id 
                          ? "bg-brand text-white shadow-sm" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", activeTab === tab.id ? "text-white" : "text-slate-500")} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
