import React, { useState, useMemo } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { Plus, Check, Clock, User, Building, AlertTriangle, Edit2, Copy, Trash2 } from 'lucide-react';
import { TaskCreator } from './TaskCreator';
import { FrequencyType, Task } from '../../types';
import { cn } from '../../lib/utils';

export function ControlPanelView() {
  const { role, tasks, getTaskStatus, markTaskComplete, addTask, deleteTask } = useMaintenance();
  const [showCreator, setShowCreator] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');

  // Group tasks by frequency
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};
    tasks.forEach(t => {
      if (!groups[t.frequencyLabel]) groups[t.frequencyLabel] = [];
      groups[t.frequencyLabel].push(t);
    });
    return groups;
  }, [tasks]);

  const order: FrequencyType[] = ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Custom'];

  const handleDuplicateTask = (task: Task) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...taskData } = task;
    addTask({
      ...taskData,
      name: `${task.name} (Copy)`
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control Panel</h2>
          <p className="text-text-muted mt-1">Execute and monitor maintenance procedures.</p>
        </div>
        
        {role === 'Administrator' && (
          <Button onClick={() => setShowCreator(!showCreator)}>
            {showCreator ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> New Task</>}
          </Button>
        )}
      </div>

      {showCreator && role === 'Administrator' && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <TaskCreator onClose={() => setShowCreator(false)} />
        </div>
      )}

      {editingTask && role === 'Administrator' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto w-full h-full">
          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark w-full max-w-2xl rounded-2xl shadow-2xl m-auto overflow-hidden">
            <TaskCreator onClose={() => setEditingTask(null)} editingTask={editingTask} />
          </div>
        </div>
      )}

      <div className="grid gap-8">
        {order.map(freq => {
          const freqTasks = groupedTasks[freq];
          if (!freqTasks || freqTasks.length === 0) return null;

          return (
            <div key={freq} className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border dark:border-border-dark pb-2 flex items-center gap-2">
                {freq} Routines
                <Badge variant="outline" className="ml-2">{freqTasks.length}</Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {freqTasks.map(task => {
                  const { nextDue, remainingDays, status } = getTaskStatus(task);
                  const isExpired = remainingDays < 0;
                  
                  return (
                    <Card key={task.id} className={cn("flex flex-col border-l-4 transition-all hover:shadow-md h-full", 
                      isExpired ? "border-rose-200 shadow-md shadow-rose-50/50" : "border-l-transparent hover:border-l-brand"
                    )}>
                      <CardContent className="p-5 flex-1 flex flex-col h-full">
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg leading-tight">{task.name}</h4>
                              {role === 'Administrator' && (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => setEditingTask(task)} 
                                    className="text-slate-400 hover:text-brand transition-colors p-1"
                                    title="Edit Task"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateTask(task)}
                                    className="text-slate-400 hover:text-brand transition-colors p-1"
                                    title="Duplicate Task"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this task?')) {
                                        deleteTask(task.id);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                              <Building className="h-3.5 w-3.5" />
                              {task.equipment} • {task.department}
                            </div>
                          </div>
                          <Badge status={status}>{status}</Badge>
                        </div>

                        <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 space-y-2 mb-6">
                           <div className="flex justify-between text-sm">
                             <span className="text-text-muted">Last Performed:</span>
                             <span className="font-mono">{task.lastPerformed ? format(new Date(task.lastPerformed), 'MMM d, yyyy') : 'Never'}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                             <span className="text-text-muted">Next Due:</span>
                             <span className="font-mono">{nextDue ? format(nextDue, 'MMM d, yyyy') : 'Immediate'}</span>
                           </div>
                           <div className="flex justify-between text-sm items-center pt-1 border-t border-border dark:border-border-dark">
                             <span className="text-text-muted">Remaining:</span>
                             <span className={`font-bold font-mono ${remainingDays < 0 ? 'text-rose-500' : remainingDays <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {remainingDays} days
                             </span>
                           </div>
                        </div>

                        <Button 
                          onClick={() => {
                            setCompleteTaskId(task.id);
                            if (!techName) {
                              setTechName(role === 'Administrator' ? 'Admin User' : 'Operator ' + Math.floor(Math.random() * 100));
                            }
                          }}
                          className={cn("w-full mt-auto group font-bold text-xs rounded-xl shadow-sm transition-all",
                            isExpired ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-neutral-50 hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 text-neutral-700"
                          )}
                          variant={isExpired ? "danger" : "ghost"}
                        >
                          <Check className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> 
                          {isExpired ? "Action Required" : "Mark Completed"}
                        </Button>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {completeTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl shadow-xl w-full max-w-sm m-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-border dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold">Complete Task</h3>
              <p className="text-xs text-text-muted mt-1">Please confirm the operator completing this task.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Operator Name</label>
                <input 
                  autoFocus
                  value={techName}
                  onChange={e => setTechName(e.target.value)}
                  className="w-full bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setCompleteTaskId(null)}>Cancel</Button>
                <Button 
                  disabled={!techName.trim()}
                  onClick={() => {
                    markTaskComplete(completeTaskId, techName.trim());
                    setCompleteTaskId(null);
                  }}
                  className="bg-brand hover:bg-brand-light text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Completion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
