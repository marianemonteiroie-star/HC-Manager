import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, HistoryLog, UserRole, TaskStatus, Category } from '../types';
import { addDays, differenceInDays, startOfDay, parseISO } from 'date-fns';

interface MaintenanceContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tasks: Task[];
  history: HistoryLog[];
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
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
const initialCategories: Category[] = [
  { id: 'c1', name: 'Heater Cooler' },
  { id: 'c2', name: 'ACT machine' },
  { id: 'c3', name: 'TEG machine' },
  { id: 'c4', name: 'HLM' }
];

const initialTasks: Task[] = [
  { id: 't1', name: 'H2O2 Check', categoryId: 'c1', frequencyLabel: 'Daily', intervalDays: 1, description: 'Check hydrogen peroxide levels', department: 'Clinical', priority: 'High', lastPerformed: startOfDay(new Date()).toISOString() },
  { id: 't2', name: 'Calibration', categoryId: 'c2', frequencyLabel: 'Weekly', intervalDays: 7, description: 'Inspect and calibrate', department: 'Maintenance', priority: 'Medium', lastPerformed: startOfDay(addDays(new Date(), -5)).toISOString() },
  { id: 't3', name: 'Water Changing', categoryId: 'c1', frequencyLabel: 'Weekly', intervalDays: 7, description: 'Drain and refill water circuits', department: 'Maintenance', priority: 'High', lastPerformed: startOfDay(addDays(new Date(), -8)).toISOString() }
];

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('Operator');
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('hc_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('hc_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  
  const [history, setHistory] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem('hc_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hc_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('hc_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('hc_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('hc_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const getTaskStatus = (task: Task): { nextDue: Date | null, remainingDays: number, status: TaskStatus } => {
    let nextDue: Date | null = null;
    
    if (task.manualNextDue) {
      nextDue = parseISO(task.manualNextDue);
    } else if (task.lastPerformed) {
      nextDue = addDays(parseISO(task.lastPerformed), task.intervalDays);
    }

    if (!nextDue) {
      return { nextDue: null, remainingDays: 0, status: 'Expired' };
    }

    const remainingDays = differenceInDays(nextDue, startOfDay(new Date()));
    
    let status: TaskStatus = 'OK';
    if (remainingDays < 0) status = 'Expired';
    else if (remainingDays <= 3) status = 'Due Soon';

    return { nextDue, remainingDays, status };
  };

  const addCategory = (name: string) => {
    setCategories(prev => [...prev, { id: Math.random().toString(36).substring(7), name }]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Optionally alert if tasks use it, or clean them up. We'll simply let them be orphan or filter out.
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      lastPerformed: null,
      manualNextDue: null,
      ...taskData,
      id: Math.random().toString(36).substring(7),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...taskData } : t));
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const markTaskComplete = (taskId: string, technician: string) => {
    const now = startOfDay(new Date());
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const oldStatus = getTaskStatus(t).status;
        const category = categories.find(c => c.id === t.categoryId);
        
        const newHistoryLog: HistoryLog = {
          id: Math.random().toString(36).substring(7),
          taskId: t.id,
          taskName: t.name,
          categoryName: category ? category.name : 'Unknown Category',
          performedAt: now.toISOString(),
          technician: technician || 'Unknown Tech',
          statusAtExecution: oldStatus
        };
        setHistory(h => [newHistoryLog, ...h]);

        return { ...t, lastPerformed: now.toISOString(), manualNextDue: null };
      }
      return t;
    }));
  };

  return (
    <MaintenanceContext.Provider value={{
      role, setRole, tasks, history, categories, addCategory, updateCategory, deleteCategory, addTask, updateTask, deleteTask, markTaskComplete, getTaskStatus, theme, toggleTheme, isAuthenticated, login, logout
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
