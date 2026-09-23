import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Volume2,
  Music,
  Image as ImageIcon,
  Subtitles,
  FileVideo,
  Play,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface WritingVideoWorkflowModalProps {
  scriptContent: string;
  onSendToVoiceStudio?: (script: string) => void;
  onClose: () => void;
}

export const WritingVideoWorkflowModal: React.FC<WritingVideoWorkflowModalProps> = ({
  scriptContent,
  onSendToVoiceStudio,
  onClose,
}) => {
  const { success } = useToast();
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [bgMusic, setBgMusic] = useState<string>('upbeat-tech');
  const [subtitleStyle, setSubtitleStyle] = useState<string>('karaoke-pop');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const steps = [
    { title: '1. AI Script Generated', desc: 'Hook, body, and CTA optimized for retention', status: 'ready', icon: Sparkles },
    { title: '2. Neural Voice Synthesis', desc: 'Studio voice with natural breath pacing', status: 'ready', icon: Volume2 },
    { title: '3. Dynamic Audio Bed', desc: 'Auto-ducked background music & SFX', status: 'configured', icon: Music },
    { title: '4. AI Visuals & B-Roll', desc: 'Visual scene cues matching each timestamp', status: 'configured', icon: ImageIcon },
    { title: '5. Animated Captions', desc: 'Word-by-word synced karaoke captions', status: 'configured', icon: Subtitles },
  ];

  const handleStartRender = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      success('Video rendering job queued! Assets ready in production studio.');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0f1017] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131422]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Script → Video Production Pipeline</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Full Automation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Turn your written script into high-converting video with synced voice and visuals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Steps Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white leading-tight">{st.title}</span>
                  <span className="text-[9px] text-slate-400 leading-tight">{st.desc}</span>
                </div>
              );
            })}
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="9:16">9:16 (TikTok / Reels / Shorts)</option>
                <option value="16:9">16:9 (YouTube Landscape)</option>
                <option value="1:1">1:1 (Square Feed / LinkedIn)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Background Audio Bed</label>
              <select
                value={bgMusic}
                onChange={(e) => setBgMusic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="upbeat-tech">Upbeat Modern Tech (Lo-Fi)</option>
                <option value="cinematic-epic">Cinematic Motivation</option>
                <option value="ambient-chill">Ambient Deep Focus</option>
                <option value="none">No Background Music (Voice Only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Caption Style</label>
              <select
                value={subtitleStyle}
                onChange={(e) => setSubtitleStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="karaoke-pop">Karaoke Dynamic Highlight</option>
                <option value="bold-yellow">Bold Yellow Subtitles</option>
                <option value="minimalist-white">Minimalist White Bar</option>
              </select>
            </div>
          </div>

          {/* Script Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Script Payload Preview
            </span>
            <pre className="p-3.5 rounded-2xl bg-[#0a0b10] border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto font-sans leading-relaxed">
              {scriptContent || 'No script text entered yet.'}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {onSendToVoiceStudio && (
              <button
                onClick={() => {
                  onSendToVoiceStudio(scriptContent);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-1.5 border border-purple-500/30"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Open in Voice Studio First</span>
              </button>
            )}

            <button
              onClick={handleStartRender}
              disabled={isExporting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 ml-auto"
            >
              <FileVideo className="w-4 h-4" />
              <span>{isExporting ? 'Preparing Assets...' : 'Generate Video Assets'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
