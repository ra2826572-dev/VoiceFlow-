import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const safeConversions = Array.isArray(conversions) ? conversions : [];

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 || hour < 4) timeGreeting = 'Good evening';

  const userName = user?.name || 'Rizwan Ahmad';

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
          {/* Active Session Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-700/50 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>VoiceFlow Studio v2.4 • Active Session</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            {timeGreeting}, {userName} 👋
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300/80 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
            Create natural AI voices and transform speech into text with industry-leading voice modeling and multilingual acoustics.
          </p>
        </div>
      </div>

      {/* 2. Quick Actions Section */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Text to Voice */}
          <div
            id="card-quick-tts"
            onClick={() => onNavigate('studio')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/90 text-purple-400 border border-purple-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                Text to Voice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Synthesize high-fidelity voice audio from scripts.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('studio');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>Open Studio</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Voice to Text */}
          <div
            id="card-quick-stt"
            onClick={() => onNavigate('voice-to-text')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/90 text-indigo-400 border border-indigo-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                Voice to Text
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Record microphone speech or transcribe audio.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('voice-to-text');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>Start Recording</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 3: New Conversion */}
          <div
            id="card-quick-new-canvas"
            onClick={() => {
              if (onNewCanvas) onNewCanvas();
              onNavigate('studio');
            }}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-fuchsia-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950/90 text-fuchsia-400 border border-fuchsia-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                New Conversion
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Start a fresh canvas with multilingual voices.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onNewCanvas) onNewCanvas();
                onNavigate('studio');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>New Canvas</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 4: History & Exports */}
          <div
            id="card-quick-history"
            onClick={() => onNavigate('history')}
            className="group p-5 rounded-2xl bg-[#12131a] hover:bg-[#161722] border border-slate-800/80 hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-950/90 text-teal-400 border border-teal-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                History & Exports
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Access your past voice audio & transcriptions.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('history');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>Browse All</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Usage & Credits Section */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          USAGE & CREDITS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Characters Used */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Characters Used</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tracking-tight">
                {charactersUsed.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ {characterLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${charPercent}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Audio Generated */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Audio Generated</span>
              <Volume2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {audioGeneratedCount}
              </span>
              <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              All voices and exports
            </p>
          </div>

          {/* Metric 3: Minutes Converted */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Minutes Converted</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tight">
                {audioMinutes}
              </span>
              <span className="text-xs text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              High definition rendering
            </p>
          </div>

          {/* Metric 4: Remaining Credits */}
          <div className="p-5 rounded-2xl bg-[#12131a] border border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Remaining Credits</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {remainingCreditsPercent}%
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Available</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${remainingCreditsPercent}%` }}
              />
            </div>
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
