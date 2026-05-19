import React, { useMemo } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CheckCircle2, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

export function DashboardView() {
  const { tasks, history, getTaskStatus } = useMaintenance();

  const stats = useMemo(() => {
    let completed = history.length;
    let upcoming = 0;
    let overdue = 0;
    let nextScheduled: Date | null = null;
    
    let statusCounts = { 'OK': 0, 'Due Soon': 0, 'Expired': 0 };
    let freqCounts: Record<string, number> = {};

    tasks.forEach(t => {
      const { nextDue, remainingDays, status } = getTaskStatus(t);
      
      statusCounts[status]++;
      freqCounts[t.frequencyLabel] = (freqCounts[t.frequencyLabel] || 0) + 1;

      if (status === 'Expired') overdue++;
      if (status === 'Due Soon') upcoming++;
      
      if (nextDue) {
        if (!nextScheduled || nextDue < nextScheduled) {
          nextScheduled = nextDue;
        }
      }
    });

    const statusData = [
      { name: 'OK', value: statusCounts['OK'], color: '#10b981' },
      { name: 'Due Soon', value: statusCounts['Due Soon'], color: '#f59e0b' },
      { name: 'Expired', value: statusCounts['Expired'], color: '#f43f5e' },
    ];

    const freqData = Object.keys(freqCounts).map(key => ({
      name: key,
      value: freqCounts[key]
    }));

    return { completed, upcoming, overdue, nextScheduled, statusData, freqData };
  }, [tasks, history, getTaskStatus]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-text-muted mt-1">Overview of maintenance operations and statuses.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Completed"
          value={stats.completed}
          variant="emerald"
        />
        <StatCard 
          title="Upcoming Tasks"
          value={stats.upcoming}
          subtitle="Tasks due in ≤ 3 days"
          variant="sky"
        />
        <StatCard 
          title="Overdue Alerts"
          value={stats.overdue}
          subtitle="Tasks past their due date"
          variant="rose"
        />
        <StatCard 
          title="Next Scheduled"
          value={stats.nextScheduled ? format(stats.nextScheduled, 'HH:mm') : '--:--'}
          subtitle={stats.nextScheduled ? format(stats.nextScheduled, 'MMM d') : ''}
          variant="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {stats.statusData.reduce((a, b) => a + b.value, 0) === 0 ? (
              <p className="text-text-muted">No task data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-4">
              {stats.statusData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-text-muted">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Frequency</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pb-12">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.freqData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="var(--color-brand)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, variant = "default" }: { title: string, value: string | number, subtitle?: string, variant?: "emerald"|"sky"|"rose"|"amber"|"default" }) {
  const styles = {
    emerald: "bg-emerald-50 border border-emerald-100 text-emerald-900",
    sky: "bg-sky-50 border border-sky-100 text-sky-900",
    rose: "bg-rose-50 border border-rose-100 text-rose-900",
    amber: "bg-amber-50 border border-amber-100 text-amber-900",
    default: "bg-surface border border-border"
  };

  const titleStyles = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    default: "text-text-muted"
  };

  return (
    <div className={`p-4 rounded-2xl shadow-sm ${styles[variant]} dark:bg-opacity-10 dark:border-opacity-20`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${titleStyles[variant]}`}>{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {subtitle && <span className={`text-[10px] font-medium uppercase ${titleStyles[variant]}`}>{subtitle}</span>}
      </div>
    </div>
  );
}
