import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Task, HistoryLog, UserRole, TaskStatus } from '../types';
import { addDays, differenceInDays, startOfDay, parseISO } from 'date-fns';

interface MaintenanceContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tasks: Task[];
  history: HistoryLog[];
  addTask: (task: Omit<Task, 'id' | 'lastPerformed'>) => void;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id' | 'lastPerformed'>>) => void;
  markTaskComplete: (taskId: string, technician: string) => void;
  getTaskStatus: (task: Task) => { nextDue: Date | null, remainingDays: number, status: TaskStatus };
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

// Initial Seed Data
const initialTasks: Task[] = [
  { id: 't1', name: 'H2O2 Check', equipment: 'HCU-001', frequencyLabel: 'Daily', intervalDays: 1, description: 'Check hydrogen peroxide levels', department: 'Clinical', priority: 'High', lastPerformed: startOfDay(new Date()).toISOString() },
  { id: 't2', name: 'Aerosol Kit', equipment: 'HCU-001', frequencyLabel: 'Weekly', intervalDays: 7, description: 'Inspect and replace if necessary', department: 'Maintenance', priority: 'Medium', lastPerformed: startOfDay(addDays(new Date(), -5)).toISOString() },
  { id: 't3', name: 'Water Changing', equipment: 'HCU-002', frequencyLabel: 'Weekly', intervalDays: 7, description: 'Drain and refill water circuits', department: 'Maintenance', priority: 'High', lastPerformed: startOfDay(addDays(new Date(), -8)).toISOString() },
  { id: 't4', name: 'Cleaning Date', equipment: 'HCU-003', frequencyLabel: 'Biweekly', intervalDays: 14, description: 'Deep clean external chassis', department: 'Sanitation', priority: 'Low', lastPerformed: null },
  { id: 't5', name: 'Water Filter', equipment: 'HCU-001', frequencyLabel: 'Monthly', intervalDays: 30, description: 'Replace internal water filter', department: 'Maintenance', priority: 'High', lastPerformed: startOfDay(addDays(new Date(), -28)).toISOString() },
];

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('Operator');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const login = (newRole: UserRole) => {
    setRole(newRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const getTaskStatus = (task: Task): { nextDue: Date | null, remainingDays: number, status: TaskStatus } => {
    if (!task.lastPerformed) {
      return { nextDue: null, remainingDays: 0, status: 'Expired' };
    }
    const lastDate = parseISO(task.lastPerformed);
    const nextDue = addDays(lastDate, task.intervalDays);
    const remainingDays = differenceInDays(nextDue, startOfDay(new Date()));
    
    let status: TaskStatus = 'OK';
    if (remainingDays < 0) status = 'Expired';
    else if (remainingDays <= 3) status = 'Due Soon';

    return { nextDue, remainingDays, status };
  };

  const addTask = (taskData: Omit<Task, 'id' | 'lastPerformed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      lastPerformed: null,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, taskData: Partial<Omit<Task, 'id' | 'lastPerformed'>>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...taskData } : t));
  };

  const markTaskComplete = (taskId: string, technician: string) => {
    const now = startOfDay(new Date());
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Record history before we update the task (so we know its status prior to execution)
        const oldStatus = getTaskStatus(t).status;
        
        const newHistoryLog: HistoryLog = {
          id: Math.random().toString(36).substring(7),
          taskId: t.id,
          taskName: t.name,
          equipment: t.equipment,
          performedAt: now.toISOString(),
          technician: technician || 'Unknown Tech',
          statusAtExecution: oldStatus
        };
        setHistory(h => [newHistoryLog, ...h]);

        return { ...t, lastPerformed: now.toISOString() };
      }
      return t;
    }));
  };

  return (
    <MaintenanceContext.Provider value={{
      role, setRole, tasks, history, addTask, updateTask, markTaskComplete, getTaskStatus, theme, toggleTheme, isAuthenticated, login, logout
    }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export const useMaintenance = () => {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider');
  return ctx;
};
