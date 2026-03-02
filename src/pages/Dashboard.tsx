import { useEffect, useState } from 'react';
import { Plus, Target, Clock, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date: string | null;
}

export function Dashboard({ onQuickAdd }: { onQuickAdd: () => void }) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [topTasks, setTopTasks] = useState<Task[]>([]);
  const [todayFocusHours, setTodayFocusHours] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, priority, due_date')
      .eq('user_id', user!.id)
      .eq('status', 'todo')
      .eq('is_top_priority', true)
      .limit(3);

    if (tasks) setTopTasks(tasks);

    const today = new Date().toISOString().split('T')[0];
    const { data: sessions } = await supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', user!.id)
      .gte('created_at', today);

    if (sessions) {
      const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      setTodayFocusHours(Math.round(totalMinutes / 60 * 10) / 10);
    }

    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    setWeeklyProgress(count || 0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's your productivity overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{todayFocusHours}</span>
          </div>
          <p className="text-blue-100 font-medium">Focus Hours Today</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl shadow-green-500/25">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{weeklyProgress}</span>
          </div>
          <p className="text-green-100 font-medium">Tasks This Week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{Math.floor((profile?.xp || 0) / 100)}</span>
          </div>
          <p className="text-purple-100 font-medium">Level</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Today's Top 3 Priorities
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {topTasks.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No priorities set. Add tasks to get started.
              </p>
            ) : (
              topTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <div className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                    {task.due_date && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            XP Progress
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Level {Math.floor((profile?.xp || 0) / 100)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {(profile?.xp || 0) % 100}/100 XP
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${((profile?.xp || 0) % 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.total_focus_hours || 0}h
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Focus</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.streak || 0}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onQuickAdd}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-xl shadow-blue-500/50 flex items-center justify-center hover:scale-110 transition-all duration-200 group"
      >
        <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
}
