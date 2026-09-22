import React, { useState } from 'react';
import { ConversionItem } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { useToast } from '../context/ToastContext';
import {
  History,
  Search,
  Filter,
  Mic,
  Headphones,
  Download,
  Copy,
  Trash2,
  Calendar,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  FileAudio,
} from 'lucide-react';

interface HistoryViewProps {
  conversions: ConversionItem[];
  onDeleteConversion: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversions = [],
  onDeleteConversion,
  onClearAll,
}) => {
  const { success, info } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text_to_speech' | 'voice_to_text'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const safeConversions = Array.isArray(conversions) ? conversions : [];

  const filtered = safeConversions.filter((item) => {
    if (!item) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const text = (item.text || '').toLowerCase();
      const voiceName = (item.voiceName || '').toLowerCase();
      const language = (item.language || '').toLowerCase();
      return (
        title.includes(q) ||
        text.includes(q) ||
        voiceName.includes(q) ||
        language.includes(q)
      );
    }
    return true;
  });

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Text copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: ConversionItem) => {
    if (!item.audioUrl) {
      info('No audio file associated with this item');
      return;
    }
    const a = document.createElement('a');
    a.href = item.audioUrl;
    a.download = `voiceflow-${item.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success('Downloaded audio file!');
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="history-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Conversion History
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              {safeConversions.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, re-listen, download or manage your previous speech generations and transcriptions.
          </p>
        </div>

        {safeConversions.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire conversion history?')) {
                onClearAll();
                success('History cleared');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search text, voice, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('text_to_speech')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'text_to_speech'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Text → Voice
          </button>
          <button
            onClick={() => setTypeFilter('voice_to_text')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'voice_to_text'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Voice → Text
          </button>
        </div>
      </div>

      {/* History Cards List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center text-slate-400 space-y-2">
          <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            No conversions found
          </h4>
          <p className="text-xs">Try adjusting your search or create new audio in the studio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isTts = item.type === 'text_to_speech';
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    {isTts ? <Mic className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isTts ? 'Text to Voice' : 'Voice to Text'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {item.language}
                      </span>

                      {item.voiceName && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Voice: <strong>{item.voiceName}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span>•</span>
                      <span>{item.duration?.toFixed(1)}s duration</span>
                      <span>•</span>
                      <span>{item.characterCount || (item.text ? item.text.length : 0)} chars</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions & Audio Player */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {item.audioUrl && (
                    <audio src={item.audioUrl} controls className="h-8 max-w-[200px]" />
                  )}

                  <button
                    onClick={() => handleCopyText(item.id, item.text)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy text"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {item.audioUrl && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                      title="Download audio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this conversion?')) {
                        onDeleteConversion(item.id);
                        success('Item deleted');
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
