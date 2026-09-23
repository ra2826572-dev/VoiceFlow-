import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Volume2,
  Clock,
  Play,
  ArrowRight,
  Sliders,
  Check,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ScriptTimelineSection } from '../../types';

interface ScriptBuilderTimelineProps {
  initialTopic: string;
  language: string;
  tone: string;
  onSendToVoiceStudio?: (scriptText: string) => void;
  onInsertToEditor: (scriptText: string) => void;
}

export const ScriptBuilderTimeline: React.FC<ScriptBuilderTimelineProps> = ({
  initialTopic,
  language,
  tone,
  onSendToVoiceStudio,
  onInsertToEditor,
}) => {
  const { success, error } = useToast();
  const [topic, setTopic] = useState<string>(initialTopic || 'How to build an audience with AI voice');
  const [format, setFormat] = useState<'youtube' | 'shorts' | 'tiktok' | 'podcast' | 'ad'>('youtube');
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [sections, setSections] = useState<ScriptTimelineSection[]>([]);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleBuildScript = async () => {
    if (!topic.trim()) {
      error('Please enter a topic or concept for the script');
      return;
    }

    setIsBuilding(true);
    try {
      const res = await fetch('/api/ai/script-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          format,
          tone,
          language,
          targetDurationMinutes: durationMinutes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
        success(`Generated ${data.sections.length}-stage timeline script!`);
      } else {
        throw new Error('Failed to build timeline script');
      }
    } catch {
      error('Script builder request failed. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleUpdateSectionText = (id: string, text: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const words = text.split(/\s+/).filter(Boolean).length;
          return {
            ...s,
            text,
            estimatedSeconds: Math.max(3, Math.round(words / 2.3)),
          };
        }
        return s;
      })
    );
  };

  const fullCompiledScript = sections
    .map((s) => `[${s.title.toUpperCase()}]\n${s.text}`)
    .join('\n\n');

  const totalWords = sections.reduce(
    (sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length,
    0
  );
  const totalSeconds = sections.reduce((sum, s) => sum + s.estimatedSeconds, 0);

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullCompiledScript);
    setCopied(true);
    success('Entire script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="p-5 rounded-3xl bg-[#11121c] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Timeline Script Architecture</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Hook → Intro → Core → Proof → CTA → Outro
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate timed, section-by-section scripts optimized for human voiceover delivery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBuildScript}
              disabled={isBuilding}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isBuilding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isBuilding ? 'Building Script...' : 'Build Structured Script'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-semibold text-slate-300">Core Topic / Concept</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 AI tools that make you sound like a pro"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-slate-300">Script Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="youtube">YouTube Long Form</option>
              <option value="shorts">YouTube Shorts (60s)</option>
              <option value="tiktok">TikTok Viral Loop</option>
              <option value="podcast">Podcast Segment</option>
              <option value="ad">Direct-Response Ad</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-slate-300">Target Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value={0.5}>30 Seconds (Short)</option>
              <option value={1}>1 Minute (Fast)</option>
              <option value={2}>2 Minutes (Standard)</option>
              <option value={3}>3 Minutes (In-depth)</option>
              <option value={5}>5 Minutes (Extended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      {sections.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1017] border border-slate-800">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">{totalWords}</span> words
            </div>
            <div className="w-[1px] h-4 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <Volume2 className="w-4 h-4" />
              <span>Estimated Voice Duration:</span>
              <span className="font-bold text-white text-sm">~{formatSeconds(totalSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFull}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Full Script</span>
            </button>

            <button
              onClick={() => onInsertToEditor(fullCompiledScript)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold flex items-center gap-1 border border-purple-500/30"
            >
              <span>Insert in Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onSendToVoiceStudio && (
              <button
                onClick={() => onSendToVoiceStudio(fullCompiledScript)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Generate Voice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline Stage Cards */}
      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="p-4 rounded-2xl bg-[#0f1017] border border-slate-800/90 hover:border-purple-500/40 transition-all space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {sec.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    ⏱️ ~{sec.estimatedSeconds}s
                  </span>
                  {onSendToVoiceStudio && (
                    <button
                      onClick={() => onSendToVoiceStudio(sec.text)}
                      title="Generate voice for this section only"
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-purple-600/30 text-[10px] text-slate-400 hover:text-purple-300 font-semibold border border-slate-800"
                    >
                      🎙️ Speak Section
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Script Text */}
              <textarea
                value={sec.text}
                onChange={(e) => handleUpdateSectionText(sec.id, e.target.value)}
                rows={3}
                className="w-full bg-[#08090e] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
              />

              {sec.tips && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                  <span className="text-purple-400 font-bold">Vocal Delivery Tip:</span>
                  <span>{sec.tips}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-3xl bg-[#0f1017] border border-slate-800 text-slate-500 space-y-2">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-xs font-semibold">Click "Build Structured Script" to generate your timeline workflow.</p>
        </div>
      )}
    </div>
  );
};
