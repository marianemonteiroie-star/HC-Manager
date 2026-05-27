import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, HistoryLog, UserRole, TaskStatus, Category } from '../types';
import { addDays, differenceInDays, startOfDay, parseISO } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

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
  const [dbReady, setDbReady] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hc_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    signInAnonymously(auth).then(() => {
      setDbReady(true);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty && categories.length === 0) {
        // Seed initial data if empty
        const batch = writeBatch(db);
        initialCategories.forEach(c => {
          batch.set(doc(db, 'categories', c.id), c);
        });
        batch.commit();
      } else {
        const cats: Category[] = [];
        snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as Category));
        setCategories(cats);
      }
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      if (snapshot.empty && tasks.length === 0) {
        const batch = writeBatch(db);
        initialTasks.forEach(t => {
          batch.set(doc(db, 'tasks', t.id), t);
        });
        batch.commit();
      } else {
        const ts: Task[] = [];
        snapshot.forEach(doc => ts.push({ id: doc.id, ...doc.data() } as Task));
        setTasks(ts);
      }
    });

    const unsubHistory = onSnapshot(collection(db, 'history'), (snapshot) => {
      const hist: HistoryLog[] = [];
      snapshot.forEach(doc => hist.push({ id: doc.id, ...doc.data() } as HistoryLog));
      // Sort history descending by performedAt
      hist.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
      setHistory(hist);
    });

    return () => {
      unsubCategories();
      unsubTasks();
      unsubHistory();
    };
  }, [dbReady]);

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

  const addCategory = async (name: string) => {
    const id = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'categories', id), { name });
  };

  const updateCategory = async (id: string, name: string) => {
    await updateDoc(doc(db, 'categories', id), { name });
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newTask = {
      lastPerformed: null,
      manualNextDue: null,
      ...taskData,
    };
    await setDoc(doc(db, 'tasks', id), newTask);
  };

  const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id'>>) => {
    await updateDoc(doc(db, 'tasks', taskId), taskData);
  };
  
  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const markTaskComplete = async (taskId: string, technician: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const now = startOfDay(new Date());
    const oldStatus = getTaskStatus(task).status;
    const category = categories.find(c => c.id === task.categoryId);

    const historyId = Math.random().toString(36).substring(7);
    const newHistoryLog = {
      taskId: task.id,
      taskName: task.name,
      categoryName: category ? category.name : 'Unknown Category',
      performedAt: now.toISOString(),
      technician: technician || 'Unknown Tech',
      statusAtExecution: oldStatus
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'history', historyId), newHistoryLog);
    batch.update(doc(db, 'tasks', taskId), {
      lastPerformed: now.toISOString(),
      manualNextDue: null
    });

    await batch.commit();
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

