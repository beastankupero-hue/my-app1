import { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalFocusHours: 0,
    avgFocusPerDay: 0,
    weeklyData: [] as number[],
    focusData: [] as number[],
  });

  useEffect(() => {
    if (user) loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    const { count: total } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id);

    const { count: completed } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('status', 'completed');

    const { data: sessions } = await supabase
      .from('focus_sessions')
      .select('duration_minutes, created_at')
      .eq('user_id', user!.id);

    const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weeklyData = last7Days.map((date) => {
      const dayTasks = sessions?.filter(
        (s) => s.created_at.startsWith(date)
      ).length || 0;
      return dayTasks;
    });

    const focusData = last7Days.map((date) => {
      const dayMinutes = sessions?.filter((s) => s.created_at.startsWith(date))
        .reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
      return Math.round(dayMinutes / 60 * 10) / 10;
    });

    setStats({
      totalTasks: total || 0,
      completedTasks: completed || 0,
      totalFocusHours: totalHours,
      avgFocusPerDay: Math.round(totalHours / 7 * 10) / 10,
      weeklyData,
      focusData,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Focus</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalFocusHours}h</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg/Day</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgFocusPerDay}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Focus Sessions (Last 7 Days)
          </h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats.weeklyData.map((value, index) => {
              const maxValue = Math.max(...stats.weeklyData, 1);
              const height = (value / maxValue) * 100;
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-600 rounded-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{days[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Focus Hours (Last 7 Days)
          </h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats.focusData.map((value, index) => {
              const maxValue = Math.max(...stats.focusData, 1);
              const height = (value / maxValue) * 100;
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-emerald-600 rounded-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{days[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Productivity Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
