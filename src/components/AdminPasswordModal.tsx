import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the Admin Password');
      return;
    }

    try {
      const res = await fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setError('');
        sessionStorage.setItem('vf_admin_unlocked', 'true');
        if (data.adminToken) {
          sessionStorage.setItem('vf_admin_token', data.adminToken);
        }
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'غلط ایڈمن پاس ورڈ! Incorrect Admin Password. Access Denied.');
        setAttempts((prev) => prev + 1);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch {
      // Fallback local check
      if (password.trim() === '591111') {
        setError('');
        sessionStorage.setItem('vf_admin_unlocked', 'true');
        onSuccess();
        onClose();
      } else {
        setError('غلط ایڈمن پاس ورڈ! Incorrect Admin Password. Access Denied.');
        setAttempts((prev) => prev + 1);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md bg-[#0e1017] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 blur-xs" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <span>Admin Console Verification</span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              یہ ایریا محفوظ ہے، براہ کرم رسائی حاصل کرنے کے لیے ایڈمن پاس ورڈ درج کریں۔
            </p>
            <p className="text-[11px] text-slate-500">
              Enter security password to access root system settings, users & analytics.
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                Admin Password
              </span>
              <span className="text-[11px] text-slate-500 font-mono">PIN Required</span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full px-4 py-2.5 bg-slate-900/90 border rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-rose-500/80 focus:ring-rose-500/50'
                    : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Unlock Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3 text-rose-400" />
            Protected Route
          </span>
          <span>Failed Attempts: {attempts}</span>
        </div>
      </div>
    </div>
  );
};
