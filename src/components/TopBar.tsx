import { Sun, Moon, LogOut, Flame, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white shadow-lg shadow-orange-500/25">
            <Flame className="w-5 h-5" />
            <span className="font-bold">{profile?.streak || 0}</span>
            <span className="text-sm opacity-90">day streak</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{profile?.xp || 0}</span>
            <span className="text-sm opacity-90">XP</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            ) : (
              <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
              {user?.email}
            </span>
          </div>

          <button
            onClick={signOut}
            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
