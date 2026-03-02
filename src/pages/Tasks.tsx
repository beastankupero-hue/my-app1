import { useEffect, useState } from 'react';
import { Plus, Check, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  is_top_priority: boolean;
  created_at: string;
}

type FilterType = 'all' | 'today' | 'overdue' | 'completed';

export function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (user) loadTasks();
  }, [user, filter]);

  const loadTasks = async () => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('due_date', today).neq('status', 'completed');
    } else if (filter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('due_date', today).neq('status', 'completed');
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed');
    }

    const { data } = await query;
    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const { error } = await supabase.from('tasks').insert({
      user_id: user!.id,
      title: newTaskTitle,
      priority: 'medium',
      status: 'todo',
    });

    if (!error) {
      setNewTaskTitle('');
      loadTasks();
    }
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updates: { status: string; completed_at?: string | null } = { status: newStatus };

    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }

    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id);

    loadTasks();
  };

  const toggleTopPriority = async (task: Task) => {
    await supabase
      .from('tasks')
      .update({ is_top_priority: !task.is_top_priority })
      .eq('id', task.id);

    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    loadTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      default: return 'border-green-500';
    }
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Tasks</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filter === f.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border-l-4 ${getPriorityColor(
                task.priority
              )} border-r border-t border-b border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg transition-all duration-200 group ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    task.status === 'completed'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                  }`}
                >
                  {task.status === 'completed' && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1">
                  <h3
                    className={`font-medium text-slate-900 dark:text-white ${
                      task.status === 'completed' ? 'line-through' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleTopPriority(task)}
                    className={`p-2 rounded-lg transition-all ${
                      task.is_top_priority
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
