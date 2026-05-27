import React, { useState } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Priority, FrequencyType, Task } from '../../types';

export function TaskCreator({ onClose, editingTask }: { onClose: () => void, editingTask?: Task }) {
  const { addTask, updateTask, categories } = useMaintenance();
  
  const [name, setName] = useState(editingTask?.name || '');
  const [categoryId, setCategoryId] = useState(editingTask?.categoryId || (categories.length > 0 ? categories[0].id : ''));
  const [freq, setFreq] = useState<FrequencyType>(editingTask?.frequencyLabel || 'Weekly');
  const [customInterval, setCustomInterval] = useState(editingTask?.intervalDays.toString() || '7');
  const [desc, setDesc] = useState(editingTask?.description || '');
  const [dept, setDept] = useState(editingTask?.department || '');
  const [priority, setPriority] = useState<Priority>(editingTask?.priority || 'Medium');
  // Initialize with local time carefully to prevent timezone bugs
  const [lastPerformedDate, setLastPerformedDate] = useState(() => {
    if (!editingTask?.lastPerformed) return '';
    const d = new Date(editingTask.lastPerformed);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [manualNextDueDate, setManualNextDueDate] = useState(() => {
    if (!editingTask?.manualNextDue) return '';
    const d = new Date(editingTask.manualNextDue);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let interval = parseInt(customInterval, 10);
    if (freq === 'Daily') interval = 1;
    if (freq === 'Weekly') interval = 7;
    if (freq === 'Biweekly') interval = 14;
    if (freq === 'Monthly') interval = 30;

    if (!name || !categoryId || isNaN(interval) || interval <= 0 || !dept) return;

    let lastPerformedIso: string | null = null;
    if (lastPerformedDate) {
      const [y, m, d] = lastPerformedDate.split('-');
      lastPerformedIso = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)).toISOString();
    }

    let manualNextDueIso: string | null = null;
    if (manualNextDueDate) {
      const [y, m, d] = manualNextDueDate.split('-');
      manualNextDueIso = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)).toISOString();
    }

    const taskData = {
      name,
      categoryId,
      frequencyLabel: freq,
      intervalDays: interval,
      description: desc,
      department: dept,
      priority,
      lastPerformed: lastPerformedIso,
      manualNextDue: manualNextDueIso || null,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  return (
    <Card className={editingTask ? "border-none shadow-none bg-transparent" : "border-brand dark:border-brand-light bg-brand/5 dark:bg-brand/10"}>
      <CardHeader>
        <CardTitle>{editingTask ? 'Edit Routine' : 'Create Custom Routine'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Task Name</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" 
                placeholder="e.g. Pump Calibration" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Machine Category</label>
              <select 
                required 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Department</label>
              <input 
                required 
                value={dept} 
                onChange={e => setDept(e.target.value)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" 
                placeholder="e.g. Bio-Med" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Frequency</label>
              <select 
                value={freq} 
                onChange={e => setFreq(e.target.value as FrequencyType)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="Daily">Daily (1 day)</option>
                <option value="Weekly">Weekly (7 days)</option>
                <option value="Biweekly">Biweekly (14 days)</option>
                <option value="Monthly">Monthly (30 days)</option>
                <option value="Custom">Custom Interval</option>
              </select>
            </div>

            {freq === 'Custom' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Interval (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  value={customInterval} 
                  onChange={e => setCustomInterval(e.target.value)}
                  className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono" 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Priority</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Last Performed Date</label>
              <input 
                type="date"
                value={lastPerformedDate} 
                onChange={e => setLastPerformedDate(e.target.value)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Next Due Date Override</label>
              <input 
                type="date"
                value={manualNextDueDate} 
                onChange={e => setManualNextDueDate(e.target.value)}
                className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <p className="text-[10px] text-text-muted">Optional. Overrides automatic calculation.</p>
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-text-muted">Description & Instructions</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand min-h-[80px]" 
              placeholder="Provide procedural details..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editingTask ? 'Save Changes' : 'Create Routine'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
