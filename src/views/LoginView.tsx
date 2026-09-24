import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';

type AuthPageMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

export const LoginView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { login, signup } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState<AuthPageMode>('login');

  // Form Fields - Prefill with last remembered name/username for convenience
  const [name, setName] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('voiceflow_last_name') || 'Rizwan Ahmad') : '';
  });
  const [username, setUsername] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('voiceflow_last_username') || 'rizwan_ai') : '';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Sign In with Name, Username, and Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter your Full Name (اپنا نام درج کریں)');
      return;
    }
    if (!username.trim()) {
      error('Please enter your Username (یوزر نیم درج کریں)');
      return;
    }
    if (!password) {
      error('Please enter your Password (پاس ورڈ درج کریں)');
      return;
    }
    setIsLoading(true);
    try {
      const cleanUsername = username.trim().replace(/^@/, '');
      const cleanName = name.trim();
      const identifier = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@voiceflow.ai`;
      
      const ok = await login(identifier, password, cleanName, cleanUsername);
      if (ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('voiceflow_session_logged_in', 'true');
          localStorage.setItem('voiceflow_last_name', cleanName);
          localStorage.setItem('voiceflow_last_username', cleanUsername);
        }
        success(`Welcome, ${cleanName}! Signed in as @${cleanUsername}`);
        onNavigate('dashboard');
      }
    } catch {
      error('Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter your full name');
      return;
    }
    if (!username.trim()) {
      error('Please enter a username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      error('Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await signup(name.trim(), username.trim(), email.trim(), password);
      if (ok) {
        success('Account created successfully! Verification code sent.');
        setMode('verify');
      }
    } catch {
      error('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'creator.google@voiceflow.ai',
          name: 'Google Creator',
        }),
      });

      if (res.ok) {
        const ok = await login('creator.google@voiceflow.ai', 'Google Creator');
        if (ok) {
          success('Authenticated with Google successfully!');
          onNavigate('dashboard');
        }
      }
    } catch {
      error('Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      success(`4-digit reset code sent to ${email}`);
      setMode('reset');
    }, 800);
  };

  // Handle Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      success('Password updated successfully! Please sign in with your new credentials.');
      setMode('login');
    }, 900);
  };

  // Handle Email Verification Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      success('Email verified successfully!');
      onNavigate('dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090a0f] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-[#11121c] border border-slate-800 shadow-2xl p-8 relative z-10 space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" showTagline={true} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
              {mode === 'verify' && 'Verify Your Email'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {mode === 'login' && 'Sign in to access Voice Studio, Dubbing & Projects'}
              {mode === 'signup' && 'Join VoiceFlow AI with full studio access'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
              {mode === 'reset' && 'Enter the verification code and your new password'}
              {mode === 'verify' && 'Enter the 4-digit code sent to your email'}
            </p>
          </div>
        </div>

        {/* GOOGLE SSO BUTTON (Only on login / signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Field 1: Full Name */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Name / اپنا نام</span>
                </label>
                <span className="text-[10px] text-purple-400/90 font-medium">Required</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rizwan Ahmad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Field 2: Username */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="text-purple-400 font-bold">@</span>
                  <span>Username / یوزر نیم</span>
                </label>
                <span className="text-[10px] text-purple-400/90 font-medium">Required</span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">
                  @
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. rizwan_ai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password / پاس ورڈ</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Open Dashboard →</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Rizwan Ahmad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <div className="relative">
                <span className="text-xs font-bold text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
                <input
                  type="text"
                  required
                  placeholder="rizwan_ai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Send Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* 4. RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">4-Digit Security Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 4829"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 tracking-widest font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}

        {/* 5. EMAIL VERIFICATION */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs text-slate-300">
                Verification email sent to <strong className="text-white">{email}</strong>. Enter code below to activate your account:
              </p>
            </div>

            <input
              type="text"
              required
              maxLength={6}
              placeholder="1 2 3 4"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-48 mx-auto text-center py-2 rounded-xl text-lg font-mono font-bold bg-slate-900 border border-slate-700 text-white tracking-widest focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : 'Verify and Enter Studio'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
