import React, { useMemo } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { format, isSameDay, addDays, startOfDay } from 'date-fns';
import { CheckCircle2, Clock } from 'lucide-react';
import { Task } from '../../types';

export function CalendarView() {
  const { tasks, getTaskStatus } = useMaintenance();

  const agenda = useMemo(() => {
    const today = startOfDay(new Date());
    
    // Create an agenda spanning the next 14 days
    const days: { date: Date, items: { task: Task, status: string }[] }[] = [];
    
    for (let i = -2; i <= 14; i++) {
      const targetDate = addDays(today, i);
      const items = tasks.filter(t => {
        const { nextDue } = getTaskStatus(t);
        return nextDue && isSameDay(nextDue, targetDate);
      }).map(t => ({ task: t, status: getTaskStatus(t).status }));

      if (items.length > 0 || i === 0) {
         days.push({ date: targetDate, items });
      }
    }
    
    return days;
  }, [tasks, getTaskStatus]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Calendar Agenda</h2>
        <p className="text-text-muted mt-1">Upcoming maintenance schedule visualization.</p>
      </div>

      <div className="relative border-l border-border dark:border-border-dark ml-4 md:ml-8 pl-6 md:pl-8 space-y-12">
        {agenda.map(({ date, items }, idx) => {
          const isToday = isSameDay(date, new Date());
          const isPast = date < startOfDay(new Date());

          return (
            <div key={idx} className="relative">
              {/* Timeline Dot */}
              <div className={`absolute -left-[29px] md:-left-[37px] top-1 h-3 w-3 rounded-full border-2 border-surface dark:border-surface-dark ${isToday ? 'bg-brand' : isPast ? 'bg-neutral-300 dark:bg-neutral-600' : 'bg-brand-light'} shadow-sm`} />
              
              <h3 className="flex items-center gap-3 text-lg font-semibold mb-4">
                <span className={`font-mono text-xl ${isToday ? 'text-brand font-bold' : isPast ? 'text-text-muted' : ''}`}>
                  {format(date, 'MMM dd')}
                </span>
                <span className="text-sm font-normal text-text-muted">
                  {format(date, 'EEEE')}
                </span>
                {isToday && <Badge variant="outline" className="text-brand border-brand/30 bg-brand/5">Today</Badge>}
              </h3>

              {items.length === 0 ? (
                <p className="text-text-muted italic text-sm py-2">No maintenance scheduled.</p>
              ) : (
                <div className="grid gap-3">
                  {items.map((item, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isPast ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                            {isPast ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.task.name}</h4>
                            <p className="text-xs text-text-muted">{item.task.equipment} · {item.task.department} · {item.task.frequencyLabel} Routine</p>
                          </div>
                        </div>
                        <Badge status={item.status as any}>{item.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
