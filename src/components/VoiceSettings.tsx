import React from 'react';
import {
  Sliders,
  Gauge,
  Music,
  Smile,
  Sparkles,
  Zap,
  Volume2,
} from 'lucide-react';
import { VoiceSettings, VoiceEmotion, VoiceStyle, PitchLevel } from '../types';

interface VoiceSettingsProps {
  settings: VoiceSettings;
  onChange: (updates: Partial<VoiceSettings>) => void;
  className?: string;
  id?: string;
}

export const VoiceSettingsPanel: React.FC<VoiceSettingsProps> = ({
  settings,
  onChange,
  className = '',
  id = 'voice-settings-panel',
}) => {
  const emotions: { key: VoiceEmotion; label: string; icon: string }[] = [
    { key: 'neutral', label: 'Neutral', icon: '😐' },
    { key: 'friendly', label: 'Friendly', icon: '😊' },
    { key: 'professional', label: 'Professional', icon: '💼' },
    { key: 'happy', label: 'Happy', icon: '😄' },
    { key: 'excited', label: 'Excited', icon: '⚡' },
    { key: 'calm', label: 'Calm', icon: '🌿' },
    { key: 'storytelling', label: 'Storyteller', icon: '📖' },
    { key: 'serious', label: 'Serious', icon: '🧐' },
    { key: 'sad', label: 'Sad', icon: '🌧️' },
  ];

  const styles: { key: VoiceStyle; label: string; desc: string }[] = [
    { key: 'natural', label: 'Natural', desc: 'Default balanced tone' },
    { key: 'conversational', label: 'Conversational', desc: 'Casual dialogue' },
    { key: 'professional', label: 'Professional', desc: 'Corporate / presentations' },
    { key: 'narrator', label: 'Narrator', desc: 'Audiobooks & documentaries' },
    { key: 'news', label: 'News / Presenter', desc: 'Broadcast clarity' },
    { key: 'podcast', label: 'Podcast', desc: 'Warm & intimate room feel' },
    { key: 'social_media', label: 'Social Media', desc: 'High energy & punchy' },
    { key: 'character', label: 'Character', desc: 'Animated & expressive' },
  ];

  const speedPresets: { label: string; value: number }[] = [
    { label: 'Slow', value: 0.8 },
    { label: 'Normal', value: 1.0 },
    { label: 'Fast', value: 1.3 },
  ];

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Voice Controls & Emotion
          </h3>
        </div>
        <button
          onClick={() =>
            onChange({
              speed: 1.0,
              pitch: 'normal',
              emotion: 'neutral',
              style: 'natural',
            })
          }
          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
        >
          Reset to default
        </button>
      </div>

      {/* Speed Slider & Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-purple-500" />
            Speaking Speed
          </span>
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
            {settings.speed.toFixed(2)}x
          </span>
        </div>

        <input
          id="setting-speed-slider"
          type="range"
          min={0.5}
          max={2.0}
          step={0.05}
          value={settings.speed}
          onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
          aria-label="Speaking speed"
        />

        {/* Speed Presets */}
        <div className="flex items-center gap-2 pt-1">
          {speedPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ speed: preset.value })}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                Math.abs(settings.speed - preset.value) < 0.05
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {preset.label} ({preset.value}x)
            </button>
          ))}
        </div>
      </div>

      {/* Pitch Segmented Control */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-indigo-500" />
            Voice Pitch
          </span>
          <span className="text-slate-500 dark:text-slate-400 capitalize text-xs">
            {settings.pitch}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['low', 'normal', 'high'] as PitchLevel[]).map((p) => (
            <button
              key={p}
              id={`btn-pitch-${p}`}
              onClick={() => onChange({ pitch: p })}
              className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                settings.pitch === p
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Emotion Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            Vocal Emotion
          </span>
          <span className="capitalize text-slate-500 dark:text-slate-400 text-xs">
            {settings.emotion}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {emotions.map((emo) => (
            <button
              key={emo.key}
              id={`btn-emotion-${emo.key}`}
              onClick={() => onChange({ emotion: emo.key })}
              className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                settings.emotion === emo.key
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200 shadow-xs ring-1 ring-purple-500'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{emo.icon}</span>
              <span className="truncate">{emo.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Style Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Voice Style Delivery
          </span>
        </div>

        <select
          id="setting-voice-style-select"
          value={settings.style}
          onChange={(e) => onChange({ style: e.target.value as VoiceStyle })}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {styles.map((style) => (
            <option key={style.key} value={style.key}>
              {style.label} — {style.desc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
