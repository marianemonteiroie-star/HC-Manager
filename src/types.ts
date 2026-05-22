export type Priority = 'Low' | 'Medium' | 'High';

export type FrequencyType = 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Custom';

export interface Task {
  id: string;
  name: string;
  equipment: string;
  frequencyLabel: FrequencyType;
  intervalDays: number;
  description: string;
  department: string;
  priority: Priority;
  lastPerformed: string | null; // ISO Date String
  manualNextDue?: string | null; // ISO Date String
}

export interface HistoryLog {
  id: string;
  taskId: string;
  taskName: string;
  equipment: string;
  performedAt: string; // ISO Date String
  technician: string;
  statusAtExecution: 'OK' | 'Due Soon' | 'Expired';
}

export type UserRole = 'Administrator' | 'Operator';

export type TaskStatus = 'OK' | 'Due Soon' | 'Expired';
