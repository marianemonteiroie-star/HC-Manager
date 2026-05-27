import React, { useState } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Button } from '../ui/Button';
import { Edit2, Trash2, FolderTree, ChevronDown, ChevronRight } from 'lucide-react';

export function CategoriesView() {
  const { categories, tasks, addCategory, updateCategory, deleteCategory } = useMaintenance();
  const [newCat, setNewCat] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newCat.trim()) {
      addCategory(newCat.trim());
      setNewCat('');
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateCategory(id, editingName.trim());
    }
    setEditingCatId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedCatId(expandedCatId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-text-muted mt-1">Manage machine and equipment categories.</p>
        </div>
      </div>

      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark w-full max-w-2xl rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2"><FolderTree className="w-5 h-5 brand" /> Equipment Categories</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <input 
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"
              placeholder="New Category Name (e.g. Heater Cooler)"
            />
            <Button onClick={handleAdd}>Add Category</Button>
          </div>

          <div className="space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
            {categories.map(c => {
              const categoryTasks = tasks.filter(t => t.categoryId === c.id);
              const isExpanded = expandedCatId === c.id;

              return (
                <div key={c.id} className="flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
                  <div className="flex justify-between items-center px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                      <button className="text-slate-400 hover:text-brand transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {editingCatId === c.id ? (
                        <div className="flex flex-1 gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                          <input 
                            value={editingName} 
                            onChange={e => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-brand/50"
                          />
                          <Button variant="ghost" onClick={() => handleSaveEdit(c.id)} className="h-9 px-3 text-sm">Save</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 select-none">{c.name}</span>
                          <span className="text-xs text-text-muted bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{categoryTasks.length} tasks</span>
                        </div>
                      )}
                    </div>

                    {editingCatId !== c.id && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={(e) => { e.stopPropagation(); setEditingCatId(c.id); setEditingName(c.name); }} className="p-1.5 text-slate-400 hover:text-brand bg-slate-50 hover:bg-brand/10 dark:bg-slate-700 dark:hover:bg-brand/20 rounded-md transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete this category? Tasks associated might lose their category group temporarily.')) {
                              deleteCategory(c.id);
                            }
                          }} 
                          className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-500/20 rounded-md transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Task List */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                      {categoryTasks.length > 0 ? (
                        <ul className="text-sm space-y-2 mt-2">
                          {categoryTasks.map(task => (
                            <li key={task.id} className="flex justify-between items-center py-1.5 px-3 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{task.name}</span>
                              <span className="text-xs text-text-muted">{task.frequencyLabel}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-muted mt-2 italic px-2">No tasks in this category.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {categories.length === 0 && <p className="text-center text-sm text-text-muted py-8">No categories added. Add one above.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
