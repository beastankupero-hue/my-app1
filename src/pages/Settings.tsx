import { useState, useEffect } from 'react';
import { Bell, User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

export function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setNotifications(profile.notifications_enabled);
    }
  }, [profile]);

  const handleNotificationsToggle = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await updateProfile({ notifications_enabled: newValue });
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
      return;
    }

    await supabase.from('tasks').delete().eq('user_id', user!.id);
    await supabase.from('focus_sessions').delete().eq('user_id', user!.id);
    await updateProfile({ xp: 0, streak: 0, total_focus_hours: 0 });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.xp || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Streak</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.streak || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Focus Hours</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.total_focus_hours || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Receive reminders and updates
              </p>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative w-14 h-8 rounded-full transition-all duration-200 ${
                notifications
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-200 ${
                  notifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Danger Zone</h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Reset all your tasks, focus sessions, and progress. This action cannot be undone.
          </p>

          <button
            onClick={handleResetData}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
