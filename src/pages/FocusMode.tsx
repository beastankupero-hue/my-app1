import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function FocusMode() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (user) loadSessionCount();
  }, [user]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            completeSession();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const loadSessionCount = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('focus_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .gte('created_at', today);

    setSessionCount(count || 0);
  };

  const completeSession = async () => {
    setIsActive(false);

    if (startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000 / 60);

      await supabase.from('focus_sessions').insert({
        user_id: user!.id,
        duration_minutes: duration,
        started_at: startTimeRef.current.toISOString(),
        completed_at: new Date().toISOString(),
      });

      await supabase.rpc('increment', {
        row_id: user!.id,
        x: 10,
      });

      loadSessionCount();
      reset();
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      startTimeRef.current = new Date();
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    startTimeRef.current = null;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Focus Mode
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {sessionCount} sessions completed today
            </p>
          </div>

          <div className="mb-12">
            <div className="text-center">
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 hover:scale-110"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>

            <button
              onClick={reset}
              className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            {[15, 25, 45, 60].map((min) => (
              <button
                key={min}
                onClick={() => {
                  if (!isActive) {
                    setMinutes(min);
                    setSeconds(0);
                  }
                }}
                disabled={isActive}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  minutes === min && !isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50'
                }`}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
