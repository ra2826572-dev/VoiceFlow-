import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  RotateCw,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PublicAudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  voiceName?: string;
  audioUrl?: string;
  duration?: number;
}

export const PublicAudioPlayerModal: React.FC<PublicAudioPlayerModalProps> = ({
  isOpen,
  onClose,
  title = 'Studio Voice Generation',
  voiceName = 'Zara Khan (Urdu Natural)',
  audioUrl,
  duration = 8.4,
}) => {
  const { success } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#131422] to-[#0c0d16] border border-purple-500/30 shadow-2xl space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              VoiceFlow Audio Player
            </span>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400">Speaker: {voiceName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl || '/placeholder.mp3'}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Waveform Visualizer Bars */}
        <div className="h-20 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 flex items-center justify-between gap-1 overflow-hidden">
          {Array.from({ length: 36 }).map((_, idx) => {
            const progress = currentTime / (duration || 1);
            const barProgress = idx / 36;
            const isPassed = barProgress <= progress;
            // Harmonic wave height
            const height = 20 + Math.sin(idx * 0.5) * 18 + Math.cos(idx * 0.9) * 14;

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? 'bg-gradient-to-t from-purple-600 to-indigo-400'
                    : 'bg-slate-800'
                }`}
                style={{ height: `${Math.max(15, Math.min(80, height))}%` }}
              />
            );
          })}
        </div>

        {/* Progress & Time */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 10}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Playback speed */}
          <button
            onClick={cyclePlaybackRate}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Center transport buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 5);
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Rewind 5s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 transition-all active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 5);
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Forward 5s"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Volume and Download */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => success('Audio downloaded in lossless format!')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Download Lossless Audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
