import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Split,
  Play,
  Pause,
  Square,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Volume2,
  Music,
  Sliders,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Music2,
  Mic,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AudioTrack, AudioClip } from '../types';

interface AudioStudioViewProps {
  initialAudioUrl?: string;
  initialTitle?: string;
}

export const AudioStudioView: React.FC<AudioStudioViewProps> = ({
  initialAudioUrl,
  initialTitle = 'Voice Master Track',
}) => {
  const { success, error } = useToast();

  // Multi-Track State
  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: 'track-voice',
      name: 'Speech Track (Voice)',
      type: 'voice',
      muted: false,
      solo: false,
      volume: 90,
      clips: [
        {
          id: 'clip-1',
          name: initialTitle,
          startTime: 1.0,
          duration: 12.5,
          trackId: 'track-voice',
          color: '#8B5CF6', // Purple
          fadeIn: 0.5,
          fadeOut: 0.8,
          volume: 95,
          speed: 1.0,
        },
      ],
    },
    {
      id: 'track-bgm',
      name: 'Background Music',
      type: 'music',
      muted: false,
      solo: false,
      volume: 40,
      clips: [
        {
          id: 'clip-2',
          name: 'Ambient Lo-Fi Bed',
          startTime: 0.0,
          duration: 25.0,
          trackId: 'track-bgm',
          color: '#3B82F6', // Blue
          fadeIn: 1.5,
          fadeOut: 2.0,
          volume: 35,
          speed: 1.0,
        },
      ],
    },
    {
      id: 'track-sfx',
      name: 'Sound Effects (SFX)',
      type: 'sfx',
      muted: false,
      solo: false,
      volume: 80,
      clips: [
        {
          id: 'clip-3',
          name: 'Intro Chime FX',
          startTime: 0.5,
          duration: 2.2,
          trackId: 'track-sfx',
          color: '#10B981', // Emerald
          fadeIn: 0.1,
          fadeOut: 0.4,
          volume: 75,
          speed: 1.0,
        },
      ],
    },
  ]);

  // Selected Clip for Inspector
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-1');

  // Player & Timeline State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.8x to 2.0x
  const [totalLength] = useState<number>(30.0); // seconds
  const [history, setHistory] = useState<AudioTrack[][]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Audio Enhancer Toggles
  const [noiseRemoval, setNoiseRemoval] = useState<boolean>(true);
  const [silenceRemoval, setSilenceRemoval] = useState<boolean>(false);
  const [normalization, setNormalization] = useState<boolean>(true);

  // Background Music Presets
  const bgmPresets = [
    { name: 'Lo-Fi Chill Hop', duration: 30 },
    { name: 'Inspiring Corporate Tech', duration: 30 },
    { name: 'Cinematic Ambient Depth', duration: 30 },
    { name: 'Podcast Chill Intro', duration: 30 },
  ];

  // Sound Effects Presets
  const sfxPresets = [
    { name: 'Digital Whoosh', duration: 1.2 },
    { name: 'Notification Bell', duration: 1.8 },
    { name: 'Camera Shutter', duration: 0.9 },
    { name: 'Subtle Pop', duration: 0.5 },
  ];

  // Simulated Playhead Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalLength) {
            setIsPlaying(false);
            return 0.0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalLength]);

  // Find selected clip object
  let selectedClip: AudioClip | undefined;
  for (const t of tracks) {
    const found = t.clips.find((c) => c.id === selectedClipId);
    if (found) {
      selectedClip = found;
      break;
    }
  }

  // Update Selected Clip Properties
  const updateClipProps = (props: Partial<AudioClip>) => {
    if (!selectedClipId) return;
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === selectedClipId ? { ...clip, ...props } : clip
        ),
      }))
    );
  };

  // Split Clip at Current Playhead
  const handleSplitClip = () => {
    if (!selectedClip) {
      error('Select a clip on the timeline to split');
      return;
    }
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.startTime + selectedClip.duration) {
      error('Place the playhead cursor inside the selected clip to split');
      return;
    }

    const firstHalfDuration = currentTime - selectedClip.startTime;
    const secondHalfDuration = selectedClip.duration - firstHalfDuration;

    const newClip: AudioClip = {
      ...selectedClip,
      id: 'clip-' + Date.now(),
      name: `${selectedClip.name} (Part 2)`,
      startTime: currentTime,
      duration: secondHalfDuration,
    };

    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== selectedClip?.trackId) return track;
        return {
          ...track,
          clips: track.clips
            .map((c) => (c.id === selectedClipId ? { ...c, duration: firstHalfDuration } : c))
            .concat(newClip),
        };
      })
    );

    success('Clip split at cursor!');
  };

  // Trim Start / End Actions
  const handleTrimStart = () => {
    if (!selectedClip) return;
    if (currentTime > selectedClip.startTime && currentTime < selectedClip.startTime + selectedClip.duration) {
      const diff = currentTime - selectedClip.startTime;
      updateClipProps({
        startTime: currentTime,
        duration: selectedClip.duration - diff,
      });
      success('Trimmed clip start to cursor');
    }
  };

  const handleTrimEnd = () => {
    if (!selectedClip) return;
    if (currentTime > selectedClip.startTime && currentTime < selectedClip.startTime + selectedClip.duration) {
      updateClipProps({
        duration: currentTime - selectedClip.startTime,
      });
      success('Trimmed clip end to cursor');
    }
  };

  // Delete Clip
  const handleDeleteClip = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== id),
      }))
    );
    setSelectedClipId('');
    success('Clip removed');
  };

  // Add Preset Music / SFX Clip
  const handleAddPresetClip = (trackType: 'music' | 'sfx', name: string, duration: number) => {
    const track = tracks.find((t) => t.type === trackType);
    if (!track) return;

    const newClip: AudioClip = {
      id: 'clip-' + Date.now(),
      name,
      startTime: currentTime,
      duration,
      trackId: track.id,
      color: trackType === 'music' ? '#3B82F6' : '#10B981',
      fadeIn: 0.5,
      fadeOut: 0.5,
      volume: 80,
      speed: 1.0,
    };

    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t))
    );
    setSelectedClipId(newClip.id);
    success(`Added "${name}" to timeline`);
  };

  // Export Mastered Audio
  const handleExport = (format: 'mp3' | 'wav') => {
    success(`Mastered multi-track session exported as studio ${format.toUpperCase()}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Scissors className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Professional Audio Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wide border border-blue-500/30">
              Multi-Track DAW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual waveform timeline editor. Cut, trim, split, add background music beds, SFX, and normalize audio.
          </p>
        </div>

        {/* Master Export Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('mp3')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MP3</span>
          </button>

          <button
            onClick={() => handleExport('wav')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 24-Bit WAV</span>
          </button>
        </div>
      </div>

      {/* Main Transport & Timeline Toolbar */}
      <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0.0);
            }}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Stop & Reset Cursor"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Timecode readout */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-purple-400">
            {Math.floor(currentTime / 60)
              .toString()
              .padStart(2, '0')}
            :
            {(currentTime % 60).toFixed(1).padStart(4, '0')}
            <span className="text-slate-600"> / 00:30.0</span>
          </div>
        </div>

        {/* Editing Tools (Cut, Trim, Split, Undo, Redo) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSplitClip}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-600/20 hover:text-purple-300 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Clip</span>
          </button>

          <button
            onClick={handleTrimStart}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
          >
            Trim Start
          </button>

          <button
            onClick={handleTrimEnd}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
          >
            Trim End
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Audio Enhancers Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={noiseRemoval}
              onChange={(e) => setNoiseRemoval(e.target.checked)}
              className="accent-purple-600 rounded"
            />
            <span>Noise Removal</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={normalization}
              onChange={(e) => setNormalization(e.target.checked)}
              className="accent-purple-600 rounded"
            />
            <span>Normalize (-14 LUFS)</span>
          </label>
        </div>
      </div>

      {/* Visual Multi-Track Timeline Canvas */}
      <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 shadow-xl overflow-x-auto">
        {/* Time ruler */}
        <div className="flex justify-between text-[10px] text-slate-600 font-mono pl-40 pr-2 border-b border-slate-800/80 pb-1">
          <span>00:00</span>
          <span>00:05</span>
          <span>00:10</span>
          <span>00:15</span>
          <span>00:20</span>
          <span>00:25</span>
          <span>00:30</span>
        </div>

        {/* Tracks List */}
        <div className="space-y-3 relative">
          {/* Vertical Playhead Cursor */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all"
            style={{
              left: `calc(10rem + ${(currentTime / totalLength) * 82}%)`,
            }}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -translate-x-[4px] -translate-y-1 shadow-sm" />
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3">
              {/* Track Header / Controls */}
              <div className="w-36 shrink-0 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{track.name}</span>
                  <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {track.type}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <button
                    onClick={() =>
                      setTracks((prev) =>
                        prev.map((t) => (t.id === track.id ? { ...t, muted: !t.muted } : t))
                      )
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      track.muted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() =>
                      setTracks((prev) =>
                        prev.map((t) => (t.id === track.id ? { ...t, solo: !t.solo } : t))
                      )
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      track.solo ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    S
                  </button>
                  <div className="flex-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      onChange={(e) =>
                        setTracks((prev) =>
                          prev.map((t) =>
                            t.id === track.id ? { ...t, volume: parseInt(e.target.value) } : t
                          )
                        )
                      }
                      className="w-full accent-purple-600 h-1"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline Track Lane */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * totalLength;
                  setCurrentTime(Math.max(0, Math.min(totalLength, newTime)));
                }}
                className="flex-1 h-14 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden cursor-crosshair"
              >
                {/* Simulated Waveform Grid Lines */}
                <div className="absolute inset-0 flex divide-x divide-slate-900/60 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1" />
                  ))}
                </div>

                {/* Render Audio Clips */}
                {track.clips.map((clip) => {
                  const leftPct = (clip.startTime / totalLength) * 100;
                  const widthPct = (clip.duration / totalLength) * 100;
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: clip.color,
                      }}
                      className={`absolute top-1 bottom-1 rounded-xl p-2 flex flex-col justify-between shadow-lg cursor-pointer select-none transition-all ${
                        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950' : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-white font-bold truncate">
                        <span className="truncate">{clip.name}</span>
                        <span className="text-[9px] opacity-80">{clip.duration.toFixed(1)}s</span>
                      </div>

                      {/* Simulated Audio Waveform Peaks */}
                      <div className="h-4 flex items-center gap-0.5 overflow-hidden opacity-75">
                        {[...Array(24)].map((_, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${Math.sin(idx) * 40 + 50}%` }}
                            className="w-1 bg-white/80 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Panel: Selected Clip Inspector & Library Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Clip Inspector (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Clip Inspector: {selectedClip ? selectedClip.name : 'No Clip Selected'}
            </h3>
            {selectedClip && (
              <button
                onClick={() => handleDeleteClip(selectedClip.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Clip</span>
              </button>
            )}
          </div>

          {selectedClip ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fade In</span>
                    <span className="font-mono text-purple-400">{selectedClip.fadeIn || 0}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={selectedClip.fadeIn || 0}
                    onChange={(e) => updateClipProps({ fadeIn: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fade Out</span>
                    <span className="font-mono text-purple-400">{selectedClip.fadeOut || 0}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={selectedClip.fadeOut || 0}
                    onChange={(e) => updateClipProps({ fadeOut: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Clip Volume</span>
                    <span className="font-mono text-purple-400">{selectedClip.volume || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedClip.volume || 100}
                    onChange={(e) => updateClipProps({ volume: parseInt(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Speed Factor</span>
                    <span className="font-mono text-purple-400">{selectedClip.speed || 1.0}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={selectedClip.speed || 1.0}
                    onChange={(e) => updateClipProps({ speed: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Click any audio clip on the timeline above to adjust fades, volume, or trim.
            </p>
          )}
        </div>

        {/* Royalty-Free BGM & SFX Quick Adder (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sound Assets Library
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">100% Royalty Free</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <Music className="w-3.5 h-3.5 text-blue-400" />
                <span>Background Music Presets</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {bgmPresets.map((bgm) => (
                  <button
                    key={bgm.name}
                    onClick={() => handleAddPresetClip('music', bgm.name, bgm.duration)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-blue-950/40 text-left border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{bgm.name}</span>
                    <Plus className="w-3 h-3 text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sound Effects (SFX)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sfxPresets.map((sfx) => (
                  <button
                    key={sfx.name}
                    onClick={() => handleAddPresetClip('sfx', sfx.name, sfx.duration)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/40 text-left border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{sfx.name}</span>
                    <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
