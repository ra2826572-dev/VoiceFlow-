import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Play,
  RotateCw,
  Heart,
  Share2,
  Sliders,
  Check,
  Volume2,
  ArrowRight,
  ShieldCheck,
  Star,
  Copy,
  X,
} from 'lucide-react';
import { MarketplaceVoiceItem } from '../types';
import { useToast } from '../context/ToastContext';
import { playVoiceSpeechPreview } from '../utils/audioSynth';
import { VOICES_CATALOG } from '../data/voices';

interface MarketplaceViewProps {
  onUseVoiceInStudio?: (voiceId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onUseVoiceInStudio }) => {
  const { success, error: toastError } = useToast();
  const [voices, setVoices] = useState<MarketplaceVoiceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [shareModalVoice, setShareModalVoice] = useState<MarketplaceVoiceItem | null>(null);

  useEffect(() => {
    fetch('/api/marketplace/voices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.voices) {
          setVoices(data.voices);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Podcast', 'Cinematic', 'Narrator', 'Commercial', 'Anime', 'Gaming'];

  const filteredVoices = voices.filter((v) => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.languageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayPreview = async (v: MarketplaceVoiceItem) => {
    if (playingId === v.id) {
      setPlayingId(null);
      return;
    }

    setPlayingId(v.id);
    const mockSample =
      v.language === 'ur' || v.language === 'ur-roman'
        ? 'وائس فلو اسٹوڈیو میں خوش آمدید۔ یہ جدید نیورل وائس ماڈل کا ڈیمو ہے۔'
        : `Hello, this is ${v.name} demonstrating broadcast voice fidelity in the studio.`;

    const foundCatalog = VOICES_CATALOG.find((c) => c.language === v.language) || VOICES_CATALOG[0];
    try {
      await playVoiceSpeechPreview(mockSample, foundCatalog);
    } catch {}
    setPlayingId(null);
  };

  const handleLike = async (voiceId: string) => {
    try {
      const res = await fetch(`/api/marketplace/voices/${voiceId}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVoices((prev) =>
        prev.map((v) => (v.id === voiceId ? { ...v, isFavorite: data.voice.isFavorite, likes: data.voice.likes } : v))
      );
    } catch (err: any) {
      toastError(err.message || 'Could not update favorite');
    }
  };

  return (
    <div id="voice-marketplace-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-[#121324] border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community & Neural Creators</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Voice Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Discover, preview, and license natural AI voices designed by top sound engineers, voice actors, and creators.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voices, accents, tags..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#12131b] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Voices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoices.map((v) => {
          const isPlaying = playingId === v.id;
          return (
            <div
              key={v.id}
              className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 hover:border-purple-500/40 shadow-lg space-y-4 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Creator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                      {v.creatorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
                        <span>{v.creatorName}</span>
                        {v.creatorVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{v.category} Model</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLike(v.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      v.isFavorite
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${v.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Voice Info */}
                <div>
                  <h3 className="text-lg font-black text-white">{v.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {v.languageName} • {v.accent} ({v.gender})
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {v.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePlayPreview(v)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isPlaying ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlaying ? 'Playing...' : 'Preview'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShareModalVoice(v)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Share Voice Card"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (onUseVoiceInStudio) {
                        onUseVoiceInStudio(v.id);
                      }
                      success(`Loaded "${v.name}" into Studio!`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <span>Use Voice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Modal */}
      {shareModalVoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Share Public Voice</h3>
              <button
                onClick={() => setShareModalVoice(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Anyone with this link can preview and use <span className="text-purple-400 font-semibold">{shareModalVoice.name}</span> in their projects.
            </p>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-300 font-mono truncate">{shareModalVoice.shareUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareModalVoice.shareUrl);
                  success('Voice link copied to clipboard!');
                  setShareModalVoice(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
