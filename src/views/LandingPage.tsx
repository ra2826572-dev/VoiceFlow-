import React, { useState, useEffect } from 'react';
import {
  Mic,
  Headphones,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  Download,
  ShieldCheck,
  ArrowRight,
  Play,
  RotateCw,
  CheckCircle2,
  Star,
  Users,
} from 'lucide-react';
import { VOICES_CATALOG } from '../data/voices';
import { AudioPlayer } from '../components/AudioPlayer';
import { Logo } from '../components/Logo';
import { playVoiceSpeechPreview } from '../utils/audioSynth';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreStudio,
}) => {
  const [activeVoicePreview, setActiveVoicePreview] = useState<string | null>(null);
  const [heroAudioUrl, setHeroAudioUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'وائس فلو اے آئی میں خوش آمدید۔ جدید مصنوعی ذہانت کے ساتھ اپنے الفاظ کو خوبصورت اور قدرتی آواز میں تبدیل کریں۔',
        language: 'ur',
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.audioUrl) {
          setHeroAudioUrl(data.audioUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handlePreviewVoice = async (voiceId: string) => {
    const voice = VOICES_CATALOG.find((v) => v.id === voiceId);
    if (!voice) return;
    setActiveVoicePreview(voiceId);
    const sample =
      voice.language === 'ur'
        ? 'وائس فلو اے آئی آپ کے الفاظ کو قدرتی اور پرکشش آواز فراہم کرتا ہے۔'
        : `Experience studio quality AI speech with ${voice.name}.`;
    try {
      await playVoiceSpeechPreview(sample, voice);
    } catch {}
    setActiveVoicePreview(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official Brand Logo Emblem Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3.5 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-purple-800/40 shadow-xl shadow-purple-500/10 backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.jpg"
                alt="VoiceFlow AI Official Logo"
                className="w-11 h-11 rounded-xl object-cover shadow-md shadow-purple-600/30 border border-purple-500/30"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg text-slate-900 dark:text-white">VoiceFlow</span>
                  <span className="font-black text-lg bg-gradient-to-r from-cyan-400 via-purple-500 to-violet-500 bg-clip-text text-transparent">AI</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-[1px] w-3 bg-cyan-400" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">AI Voice &amp; Text Studio</span>
                  <span className="h-[1px] w-3 bg-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Next-Generation Multilingual AI Speech Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Turn Text Into{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Human-Like Voice
            </span>{' '}
            in Seconds.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Generate natural AI voiceovers and transcribe voice to text with studio fidelity, 
            multilingual emotion controls, and instant MP3/WAV downloads.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-cta-get-started"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try VoiceFlow AI Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-cta-explore-studio"
              onClick={onExploreStudio}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Open Voice Studio</span>
            </button>
          </div>

          {/* Social Proof metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Urdu, English, Arabic & 15+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Lossless WAV & MP3 Export</span>
            </div>
          </div>

          {/* Interactive Hero Demo Player */}
          <div className="mt-14 max-w-3xl mx-auto text-left shadow-2xl rounded-3xl overflow-hidden ring-1 ring-purple-500/20">
            <AudioPlayer
              voiceName="Zara Khan (Urdu Natural)"
              language="Urdu"
              inputText="وائس فلو اے آئی میں خوش آمدید۔ جدید مصنوعی ذہانت کے ساتھ اپنے الفاظ کو خوبصورت اور قدرتی آواز میں تبدیل کریں۔"
              duration={7.5}
              audioUrl={heroAudioUrl}
            />
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Crafted for Modern Content Creators & SaaS
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Everything you need to produce audiobooks, podcasts, YouTube narrations, and instant transcriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Ultra-Realistic Text-to-Speech
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Convert written text into expressive speech with lifelike pauses, natural intonation, and authentic emotion modeling.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Accurate Voice-to-Text
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Transcribe speech recordings and audio files into clean, editable text with punctuation and multilingual recognition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Emotion & Style Controls
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tune pacing, pitch, and vocal mood across 8+ modes: Professional, Friendly, Storyteller, News, and Conversational.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE VOICES SHOWCASE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Voice Gallery
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                Listen to Our Natural AI Voices
              </h2>
            </div>
            <button
              onClick={onExploreStudio}
              className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5"
            >
              <span>Explore all voices in Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICES_CATALOG.slice(0, 8).map((voice) => {
              const isPlaying = activeVoicePreview === voice.id;
              return (
                <div
                  key={voice.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={voice.avatarUrl}
                      alt={voice.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {voice.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {voice.languageName} • {voice.gender}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePreviewVoice(voice.id)}
                    disabled={isPlaying}
                    className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                    aria-label={`Listen to ${voice.name}`}
                  >
                    {isPlaying ? (
                      <RotateCw className="w-4 h-4 animate-spin text-purple-600" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Three Steps to Studio Speech
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Intuitive workflow designed for speed, flexibility, and creative freedom.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded-md">
                STEP 01
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-4">
                Enter or Dictate Text
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Type or paste your script in any supported language with full RTL support for Urdu and Arabic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded-md">
                STEP 02
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-4">
                Select Voice & Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Choose gender, accent, speaking rate, pitch, and emotion style to match your brand tone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded-md">
                STEP 03
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-4">
                Play, Edit & Download
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Listen with waveform scrubbing, adjust speed on the fly, and download audio as WAV or MP3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showTagline={true} />
          <div className="flex items-center gap-6">
            <span>© 2026 VoiceFlow AI. All rights reserved.</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
