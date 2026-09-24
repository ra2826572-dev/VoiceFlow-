import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsage } from '../context/UsageContext';
import { ConversionItem } from '../types';
import {
  Sparkles,
  Radio,
  Mic,
  PlusCircle,
  History,
  FileText,
  Volume2,
  Clock,
  Zap,
  Play,
  Pause,
  Download,
  Trash2,
  Headphones,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
  conversions: ConversionItem[];
  onDeleteConversion: (id: string) => void;
  onNewCanvas?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  conversions = [],
  onDeleteConversion,
  onNewCanvas,
}) => {
  const { user } = useAuth();
  const { usage } = useUsage();
  const safeConversions = Array.isArray(conversions) ? conversions : [];

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 || hour < 4) timeGreeting = 'Good evening';

  const userName = user?.name || 'Rizwan Ahmad';
  const userHandle = user?.username ? `@${user.username.replace(/^@/, '')}` : '@rizwan_ai';

  // Stats matching screenshot & synchronized with user profile
  const charactersUsed = user?.charactersUsed ?? 14874;
  const characterLimit = user?.characterLimit ?? 50000;
  const charPercent = Math.min(100, Math.round((charactersUsed / characterLimit) * 100));

  const audioGeneratedCount = user?.conversionsCount ?? 46;
  const audioMinutes = (user?.audioGeneratedMinutes ?? 29.2).toFixed(1);
  const remainingCreditsPercent = 70;

  const handlePlayAudio = (item: ConversionItem) => {
    if (playingId === item.id) {
      if (currentAudio) {
        currentAudio.pause();
      }
      setPlayingId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
      audio.play().catch(() => setPlayingId(null));
      setCurrentAudio(audio);
      setPlayingId(item.id);
    } else {
      // If conversion doesn't have an audioUrl, navigate to studio to generate or preview
      onNavigate('studio');
    }
  };

  return (
    <div id="dashboard-view" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      {/* 1. Top Welcome Banner */}
      <div
        id="dash-welcome-banner"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#160b27] border border-purple-800/40 p-6 sm:p-8 shadow-xl"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute right-0 -bottom-8 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Active Session & Logged In User Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-700/50 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>VoiceFlow Studio v2.4 • Active Session</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online: <span className="text-white font-black">{userName}</span> ({userHandle})</span>
            </div>
          </div>

          {/* Headline with Username Display */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {timeGreeting}, {userName} 👋
            </h1>
            <span className="text-xs sm:text-sm font-bold text-purple-300 font-mono px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 shadow-xs">
              {userHandle}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-slate-300/80 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
            Create natural AI voices and transform speech into text with industry-leading voice modeling and multilingual acoustics.
          </p>
        </div>
      </div>

      {/* 2. Studio Modules Hub */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            STUDIO MODULES & CREATIVE SUITE
          </h2>
          <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
            8 Pro Systems Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: AI Voice Features */}
          <div
            id="card-quick-voice-studio"
            onClick={() => onNavigate('voice-studio')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/90 text-purple-400 border border-purple-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>AI Voice Studio</span>
                <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">Cloning</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Upload sample voices, clone custom voices, and browse 10+ voice categories.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-0.5">
              <span>Open Voice Studio</span>
              <span>→</span>
            </span>
          </div>

          {/* Module 3: AI Writing Studio */}
          <div
            id="card-quick-writing-studio"
            onClick={() => onNavigate('writing-studio')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-fuchsia-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950/90 text-fuchsia-400 border border-fuchsia-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>AI Writing Studio</span>
                <span className="text-[9px] px-1 rounded bg-fuchsia-500/20 text-fuchsia-300">Scripts</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate YouTube, TikTok, Reel scripts, ad copy, and blogs with tone controls.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-400 group-hover:translate-x-0.5">
              <span>Write with AI</span>
              <span>→</span>
            </span>
          </div>

          {/* Module 4: Multi-Language AI */}
          <div
            id="card-quick-multi-lang"
            onClick={() => onNavigate('multi-language')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Multi-Language AI</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300">15+</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Text and voice-to-voice translation across Urdu, English, Hindi, and Arabic.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5">
              <span>Translate Now</span>
              <span>→</span>
            </span>
          </div>

          {/* Module 7: Project Management */}
          <div
            id="card-quick-projects"
            onClick={() => onNavigate('projects')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/90 text-amber-400 border border-amber-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Projects & Folders</span>
                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">Files</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Organize voices, audio timelines, scripts, and exports in custom folders.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5">
              <span>View Projects</span>
              <span>→</span>
            </span>
          </div>

          {/* Module 8: Voice to Text STT */}
          <div
            id="card-quick-stt"
            onClick={() => onNavigate('voice-to-text')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-950/90 text-teal-400 border border-teal-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Voice to Text</span>
                <span className="text-[9px] px-1 rounded bg-teal-500/20 text-teal-300">STT</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Record microphone speech or upload audio to generate accurate transcripts.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:translate-x-0.5">
              <span>Start Dictation</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Performance Metrics Hub */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            SYSTEM PERFORMANCE & USAGE ANALYTICS
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Plan:
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              usage?.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400' : 
              usage?.role === 'admin' || usage?.role === 'super_admin' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-700/50 text-slate-400'
            }`}>
              {usage?.role === 'admin' || usage?.role === 'super_admin' ? 'ADMIN' : (usage?.plan || 'FREE').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: AI Voice Usage */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">AI Voice Generations</span>
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {usage?.isUnlimitedAdmin ? '∞' : `${usage?.features.TEXT_TO_VOICE.used} / ${usage?.features.TEXT_TO_VOICE.limit}`}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monthly</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${usage?.features.TEXT_TO_VOICE.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Metric 2: AI Writing Usage */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">AI Writing Generations</span>
              <FileText className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {usage?.isUnlimitedAdmin ? '∞' : `${usage?.features.AI_WRITING.used} / ${usage?.features.AI_WRITING.limit}`}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Generations</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-fuchsia-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${usage?.features.AI_WRITING.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Translation Usage */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Translation Credits</span>
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {usage?.isUnlimitedAdmin ? '∞' : `${usage?.features.TRANSLATION.used} / ${usage?.features.TRANSLATION.limit}`}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credits</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${usage?.features.TRANSLATION.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Metric 4: Subscription Status */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Plan Status</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {usage?.plan === 'pro' ? 'PRO' : usage?.isUnlimitedAdmin ? 'ADMIN' : 'FREE'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${usage?.plan === 'pro' ? 'text-emerald-400' : 'text-slate-500'}`}>
                {usage?.plan === 'pro' ? 'Active' : 'Upgrade Required'}
              </span>
            </div>
            {usage?.plan !== 'pro' && !usage?.isUnlimitedAdmin && (
              <button 
                onClick={() => onNavigate('billing')}
                className="w-full py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
            {(usage?.plan === 'pro' || usage?.isUnlimitedAdmin) && (
              <div className="w-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest py-1 text-center rounded border border-emerald-500/20">
                Full Access Unlocked
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Recent Conversions Section */}
      <section className="rounded-2xl border border-slate-800/80 bg-[#12131a] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Recent Conversions</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            View all →
          </button>
        </div>

        {safeConversions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No conversions recorded yet. Try creating one in the Text to Voice studio!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {safeConversions.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(item)}
                    className="w-9 h-9 rounded-xl bg-purple-950/80 text-purple-400 hover:bg-purple-900 border border-purple-800/50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    title={playingId === item.id ? 'Pause' : 'Play Audio'}
                  >
                    {playingId === item.id ? (
                      <Pause className="w-4 h-4 text-purple-300" />
                    ) : item.type === 'voice_to_text' ? (
                      <Headphones className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate max-w-sm">
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold uppercase">
                        {item.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                      {item.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs self-end sm:self-center shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {item.duration ? `${item.duration.toFixed(1)}s` : '5.0s'}
                  </span>

                  {item.audioUrl && (
                    <a
                      href={item.audioUrl}
                      download={`voiceflow-${item.id}.wav`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Download audio"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteConversion(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
