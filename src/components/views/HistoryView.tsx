import React, { useState, useMemo } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Search, Download, Printer, FileText } from 'lucide-react';

export function HistoryView() {
  const { history } = useMaintenance();
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter(log => {
      const matchSearch = log.taskName.toLowerCase().includes(search.toLowerCase()) || 
                          log.id.toLowerCase().includes(search.toLowerCase());
      const matchTech = techFilter === '' || log.technician === techFilter;
      const matchStatus = statusFilter === '' || log.statusAtExecution === statusFilter;
      
      let matchDate = true;
      if (startDate || endDate) {
        const logDate = parseISO(log.performedAt);
        if (startDate && logDate < startOfDay(parseISO(startDate))) matchDate = false;
        if (endDate && logDate > endOfDay(parseISO(endDate))) matchDate = false;
      }

      return matchSearch && matchTech && matchStatus && matchDate;
    });
  }, [history, search, techFilter, statusFilter, startDate, endDate]);

  const uniqueTechs = Array.from(new Set(history.map(h => h.technician)));
  const uniqueStatuses = Array.from(new Set(history.map(h => h.statusAtExecution)));

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Task Name', 'Category', 'Technician', 'Status at Execution', 'Performed At'];
    const rows = filteredHistory.map(log => [
      log.id,
      `"${log.taskName}"`,
      `"${log.categoryName}"`,
      `"${log.technician}"`,
      log.statusAtExecution,
      format(new Date(log.performedAt), 'yyyy-MM-dd HH:mm')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maintenance_history_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handlePrint = () => {
    setShowExportModal(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance History</h2>
          <p className="text-text-muted mt-1">Immutable ledger of completed tasks.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="brand" onClick={() => setShowExportModal(true)}>
            <FileText className="h-4 w-4 mr-2" /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export to Excel
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none print:bg-transparent">
        <div className="p-4 border-b border-border dark:border-border-dark flex flex-col md:flex-row gap-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-t-xl print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks or IDs..." 
              className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex gap-2 relative">
            {(startDate || endDate) && (
              <Button 
                variant="ghost" 
                className="text-xs" 
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                Clear Dates
              </Button>
            )}
            <select 
              value={techFilter} 
              onChange={e => setTechFilter(e.target.value)}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Technicians</option>
              {uniqueTechs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="hidden print:block pb-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight uppercase">Perfusion <span className="text-brand">HC</span></h1>
            <p className="text-text-muted font-medium mt-1 uppercase text-sm">
              Maintenance History Report
              {(startDate || endDate) && ` (${startDate || '*'} - ${endDate || '*'})`}
            </p>
          </div>
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 uppercase font-bold tracking-wider print:bg-transparent print:border-b print:border-slate-300">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Task Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Performed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 print:divide-slate-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted italic text-xs">
                    No history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-text-muted">{log.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{log.taskName}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{log.categoryName}</td>
                    <td className="px-4 py-3 text-slate-500">{log.technician}</td>
                    <td className="px-4 py-3">
                      <Badge status={log.statusAtExecution}>{log.statusAtExecution}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {format(new Date(log.performedAt), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark w-full max-w-sm ml-auto mr-auto rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand/10 p-2 rounded-lg text-brand">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Export PDF Report</h3>
            </div>
            
            <p className="text-sm text-text-muted mb-4">Select the specific date period you want to include in this report.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="w-full bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-border dark:border-border-dark">
              <Button variant="ghost" onClick={() => setShowExportModal(false)}>Cancel</Button>
              <Button variant="brand" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print & Export PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          main, main * {
            visibility: visible;
          }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { margin: 1cm; size: landscape; }
        }
      `}} />
    </div>
  );
}
