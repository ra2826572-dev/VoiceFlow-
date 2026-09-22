import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Copy,
  BookmarkPlus,
  Check,
  Sparkles,
  FileAudio,
} from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useToast } from '../context/ToastContext';

interface AudioPlayerProps {
  audioUrl?: string;
  duration?: number;
  inputText?: string;
  voiceName?: string;
  language?: string;
  onSaveToHistory?: () => void;
  className?: string;
  id?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration = 5,
  inputText = '',
  voiceName = 'AI Voice',
  language = 'English',
  onSaveToHistory,
  className = '',
  id = 'custom-audio-player',
}) => {
  const { success, info } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>('wav');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (duration && duration > 0) {
      setTotalDuration(duration);
    }
  }, [duration]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (audioRef.current.duration && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleDownload = () => {
    if (!audioUrl) {
      info('No audio file available to download');
      return;
    }
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voiceflow-${voiceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${downloadFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success(`Downloaded audio successfully as .${downloadFormat.toUpperCase()}`);
  };

  const handleCopyText = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setIsCopied(true);
    success('Text copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'VoiceFlow AI Audio',
        text: inputText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveToHistory) {
      onSaveToHistory();
    }
    success('Saved to your conversion history!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      id={id}
      className={`rounded-2xl p-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-purple-500/20 shadow-xl shadow-purple-950/20 text-white ${className}`}
    >
      {/* Hidden Native Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileAudio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-white">{voiceName}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                {language}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs md:max-w-md">
              {inputText || 'Generated natural AI speech output'}
            </p>
          </div>
        </div>

        {/* Format Selector: WAV or MP3 */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setDownloadFormat('wav')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              downloadFormat === 'wav'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WAV
          </button>
          <button
            onClick={() => setDownloadFormat('mp3')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              downloadFormat === 'mp3'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MP3
          </button>
        </div>
      </div>

      {/* Animated Waveform Canvas */}
      <div className="my-3 px-2 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
        <WaveformVisualizer isPlaying={isPlaying} height={52} barCount={44} />
      </div>

      {/* Seekbar & Timestamps */}
      <div className="space-y-1 my-3">
        <input
          id="audio-seek-slider"
          type="range"
          min={0}
          max={totalDuration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          aria-label="Audio progress slider"
        />
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Core Player Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Replay */}
          <button
            id="btn-audio-replay"
            onClick={handleReplay}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Replay from start"
            aria-label="Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            id="btn-audio-play-pause"
            onClick={togglePlay}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 group">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 opacity-60 group-hover:opacity-100 transition-opacity"
              aria-label="Volume control"
            />
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase">Speed</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                playbackSpeed === speed
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Download & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-copy-audio-text"
            onClick={handleCopyText}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Copy Text"
            aria-label="Copy text"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            id="btn-save-to-history"
            onClick={handleSave}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Save to History"
            aria-label="Save to History"
          >
            {isSaved ? (
              <Check className="w-4 h-4 text-purple-400" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
          </button>

          <button
            id="btn-share-audio"
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Share"
            aria-label="Share audio"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            id="btn-download-audio"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all ml-1"
            title={`Download as ${downloadFormat.toUpperCase()}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
