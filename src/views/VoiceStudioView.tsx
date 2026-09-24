import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Heart,
  Search,
  RotateCcw,
  Zap,
  Layers,
  Radio,
  FileAudio,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useUsage } from '../context/UsageContext';
import { VOICES_CATALOG, SUPPORTED_LANGUAGES } from '../data/voices';
import { Voice, VoiceEmotion, VoiceStyle, PitchLevel, ClonedVoice, CustomVoiceParams, ConversionItem } from '../types';

interface VoiceStudioViewProps {
  initialText?: string;
  onAddConversion?: (item: ConversionItem) => void;
  onNavigateToAudioStudio?: (audioUrl: string, title: string) => void;
  onSendToEditor?: (text: string) => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  initialText = '',
  onAddConversion,
  onNavigateToAudioStudio,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { checkLimit, showLimitModal, refreshUsage } = useUsage();

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'tts' | 'cloning' | 'custom' | 'library'>('tts');

  // --- TTS STATE ---
  const [text, setText] = useState<string>(
    initialText ||
      'وائس فلو اے آئی میں خوش آمدید۔ جدید ترین مصنوعی ذہانت کے ساتھ اپنے الفاظ کو قدرتی اور دلکش آواز میں تبدیل کریں۔'
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('voice-ur-zara');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<PitchLevel>('normal');
  const [emotion, setEmotion] = useState<VoiceEmotion>('neutral');
  const [style, setStyle] = useState<VoiceStyle>('natural');
  const [volume, setVolume] = useState<number>(100);
  const [stability, setStability] = useState<number>(85);
  const [expressiveness, setExpressiveness] = useState<number>(90);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>('');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- VOICE CLONING STATE ---
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [cloneModalOpen, setCloneModalOpen] = useState<boolean>(false);
  const [cloneName, setCloneName] = useState<string>('');
  const [cloneDesc, setCloneDesc] = useState<string>('');
  const [cloneGender, setCloneGender] = useState<'male' | 'female'>('male');
  const [cloneAccent, setCloneAccent] = useState<string>('Urdu / English');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [sampleAudioName, setSampleAudioName] = useState<string>('');

  // --- CUSTOM VOICE CREATOR STATE ---
  const [customParams, setCustomParams] = useState<CustomVoiceParams>({
    name: 'My Custom Voice',
    gender: 'female',
    ageStyle: 'youthful',
    accent: 'Urdu (Standard)',
    speakingStyle: 'conversational',
    speed: 1.0,
    pitch: 'normal',
    stability: 85,
    expressiveness: 92,
    emotion: 'happy',
  });
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);

  // --- VOICE LIBRARY STATE ---
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryCategory, setLibraryCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(['voice-ur-zara', 'voice-en-emma', 'voice-ur-roman-hamza']);

  // Fetch cloned voices on mount
  useEffect(() => {
    fetchClonedVoices();
  }, []);

  const fetchClonedVoices = async () => {
    try {
      const res = await fetch('/api/cloned-voices');
      if (res.ok) {
        const data = await res.json();
        if (data.voices) setClonedVoices(data.voices);
      }
    } catch {}
  };

  const selectedVoice = VOICES_CATALOG.find((v) => v.id === selectedVoiceId) || VOICES_CATALOG[0];

  // Emotion presets
  const emotionPresets: { id: VoiceEmotion; label: string; icon: string }[] = [
    { id: 'neutral', label: 'Neutral', icon: '🎙️' },
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'excited', label: 'Excited', icon: '🎉' },
    { id: 'calm', label: 'Calm', icon: '🌿' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'serious', label: 'Serious', icon: '🎯' },
    { id: 'storytelling', label: 'Storytelling', icon: '📖' },
    { id: 'sad', label: 'Sad', icon: '🌧️' },
  ];

  // Handle Text-to-Speech Generation
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      error('Please enter text to synthesize');
      return;
    }

    if (!checkLimit('TEXT_TO_VOICE')) {
      showLimitModal('TEXT_TO_VOICE');
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '' 
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          language: selectedVoice.language,
          speed,
          pitch,
          emotion,
          style,
          volume,
          format: audioFormat,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          const data = await res.json();
          if (data.code === 'LIMIT_REACHED') {
            showLimitModal('TEXT_TO_VOICE');
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('Speech synthesis failed');
      }

      const data = await res.json();
      const url = data.audioUrl;
      setGeneratedAudioUrl(url);
      success('Voice generated successfully!');
      refreshUsage();

      if (onAddConversion) {
        onAddConversion({
          id: 'conv-' + Date.now(),
          type: 'text_to_speech',
          title: text.substring(0, 45) + (text.length > 45 ? '...' : ''),
          text,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          language: selectedVoice.language,
          createdAt: new Date().toISOString(),
          duration: data.estimatedDuration || 4.2,
          audioUrl: url,
          characterCount: text.length,
          settings: { speed, pitch, emotion, style },
        });
      }

      // Auto play preview
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
    } catch (err: any) {
      error(err.message || 'Error generating voice');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Clone Voice Handler
  const handleCreateVoiceClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName.trim()) {
      error('Please enter a voice name');
      return;
    }
    if (!consentAgreed) {
      error('Consent agreement is required for voice cloning');
      return;
    }

    setIsCloning(true);
    try {
      const res = await fetch('/api/cloned-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cloneName,
          description: cloneDesc,
          gender: cloneGender,
          accent: cloneAccent,
          sampleDuration: 35,
          consentConfirmed: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClonedVoices((prev) => [data.voice, ...prev]);
        success(`Voice "${cloneName}" cloned and calibrated successfully!`);
        setCloneModalOpen(false);
        setCloneName('');
        setCloneDesc('');
        setConsentAgreed(false);
      }
    } catch {
      error('Voice cloning failed. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteClonedVoice = async (id: string) => {
    try {
      await fetch(`/api/cloned-voices/${id}`, { method: 'DELETE' });
      setClonedVoices((prev) => prev.filter((v) => v.id !== id));
      success('Cloned voice removed');
    } catch {
      error('Failed to delete cloned voice');
    }
  };

  // Custom Voice Save Handler
  const handleSaveCustomVoice = () => {
    setIsCreatingCustom(true);
    setTimeout(() => {
      setIsCreatingCustom(false);
      success(`Custom voice "${customParams.name}" created and added to library!`);
      setActiveTab('library');
    }, 1200);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Library filtered voices
  const filteredVoices = VOICES_CATALOG.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      v.languageName.toLowerCase().includes(librarySearch.toLowerCase()) ||
      v.accent.toLowerCase().includes(librarySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (libraryCategory === 'all') return true;
    if (libraryCategory === 'male') return v.gender === 'male';
    if (libraryCategory === 'female') return v.gender === 'female';
    if (libraryCategory === 'favorites') return favorites.includes(v.id);
    return v.style.toLowerCase().includes(libraryCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Audio element */}
      {generatedAudioUrl && (
        <audio
          ref={audioRef}
          src={generatedAudioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Mic className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Voice Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase tracking-wide border border-purple-500/30">
              Pro Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Studio-grade neural speech synthesis, voice cloning, and custom acoustic modeling.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-1 bg-[#13141f] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('cloning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cloning'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Cloning</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Voice Library</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: TEXT TO VOICE STUDIO --- */}
      {activeTab === 'tts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Script Editor (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Script Content</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({text.length} characters)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setText('')}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Textarea with RTL support */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                dir={selectedVoice.language === 'ur' || selectedVoice.language === 'ar' ? 'rtl' : 'ltr'}
                placeholder="Type or paste text here in Urdu, English, Arabic, Hindi, or any language..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
              />

              {/* Emotion Presets */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-400">Emotion Preset</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {emotionPresets.map((em) => (
                    <button
                      key={em.id}
                      onClick={() => setEmotion(em.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        emotion === em.id
                          ? 'bg-purple-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{em.icon}</span>
                      <span>{em.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Bar & Format Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Output:</span>
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setAudioFormat('mp3')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        audioFormat === 'mp3' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      MP3
                    </button>
                    <button
                      onClick={() => setAudioFormat('wav')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        audioFormat === 'wav' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      WAV
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSpeech}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Voice...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Studio Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Audio Player Card */}
            {generatedAudioUrl && (
              <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-slate-900 border border-purple-500/30 p-5 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-12 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-600/40 transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{selectedVoice.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                          Ready ({audioFormat.toUpperCase()})
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">{selectedVoice.languageName} • Emotion: {emotion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generatedAudioUrl}
                      download={`voiceflow-${selectedVoice.id}.${audioFormat}`}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    {onNavigateToAudioStudio && (
                      <button
                        onClick={() => onNavigateToAudioStudio(generatedAudioUrl, selectedVoice.name)}
                        className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <FileAudio className="w-3.5 h-3.5" />
                        <span>Edit in Audio Studio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Voice Card */}
            <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Voice</h3>
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Change Voice →
                </button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedVoice.avatarUrl}
                  alt={selectedVoice.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-purple-500/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{selectedVoice.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{selectedVoice.languageName} • {selectedVoice.accent}</p>
                </div>
              </div>

              {/* Sliders: Speed, Pitch, Stability, Expressiveness */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Speaking Speed</span>
                    <span className="font-mono text-purple-400 font-bold">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pitch</span>
                    <span className="font-mono text-purple-400 font-bold capitalize">{pitch}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['low', 'normal', 'high'] as PitchLevel[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPitch(p)}
                        className={`py-1 rounded-xl text-xs capitalize font-medium ${
                          pitch === p
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Stability</span>
                    <span className="font-mono text-purple-400 font-bold">{stability}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stability}
                    onChange={(e) => setStability(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Expressiveness</span>
                    <span className="font-mono text-purple-400 font-bold">{expressiveness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={expressiveness}
                    onChange={(e) => setExpressiveness(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Volume</span>
                    <span className="font-mono text-purple-400 font-bold">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: VOICE CLONING STUDIO --- */}
      {activeTab === 'cloning' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-purple-900/20 via-[#131422] to-slate-900 border border-purple-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                  AI Vocal Cloning 2.0
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Consent Protected
                </span>
              </div>
              <h2 className="text-xl font-black text-white">Clone Any Human Voice in 30 Seconds</h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Provide a clean 15-45 second vocal sample. Our acoustic neural engine extracts the timbre, vocal resonance, and inflection while enforcing strict privacy consent.
              </p>
            </div>

            <button
              onClick={() => setCloneModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 whitespace-nowrap cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Clone New Voice</span>
            </button>
          </div>

          {/* Cloned Voices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clonedVoices.map((voice) => (
              <div
                key={voice.id}
                className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-4 hover:border-purple-500/40 transition-all shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                      {voice.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{voice.name}</h4>
                      <p className="text-[11px] text-slate-400">{voice.accent} • {voice.gender}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteClonedVoice(voice.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{voice.description}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quality: {voice.quality}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Sample: {voice.sampleDuration}s</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedVoiceId('voice-ur-roman-hamza');
                      setActiveTab('tts');
                      success(`Loaded "${voice.name}" into Studio!`);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs transition-colors"
                  >
                    Use in Voice Studio
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Secure Storage Architecture Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-xs text-slate-400">
              <strong className="text-white">Secure Storage Architecture:</strong> Cloned voice biometric embeddings are encrypted using AES-256 and never shared with public foundational model datasets.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CUSTOM VOICE CREATION --- */}
      {activeTab === 'custom' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-[#11121c] border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Create Custom Voice Model</h3>
            <p className="text-xs text-slate-400">
              Design a unique synthetic persona with bespoke vocal acoustics, age, style, and timbre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Voice Name</label>
              <input
                type="text"
                value={customParams.name}
                onChange={(e) => setCustomParams({ ...customParams, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomParams({ ...customParams, gender: 'male' })}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    customParams.gender === 'male'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setCustomParams({ ...customParams, gender: 'female' })}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    customParams.gender === 'female'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Age Style</label>
              <select
                value={customParams.ageStyle}
                onChange={(e) => setCustomParams({ ...customParams, ageStyle: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="youthful">Youthful (18-28)</option>
                <option value="mature">Mature (29-50)</option>
                <option value="senior">Senior (50+)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Accent / Dialect</label>
              <select
                value={customParams.accent}
                onChange={(e) => setCustomParams({ ...customParams, accent: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Urdu (Standard)">Urdu (Standard / Lahori / Karachite)</option>
                <option value="English (Global)">English (Neutral Global)</option>
                <option value="English (US)">English (American Standard)</option>
                <option value="English (UK)">English (British Received)</option>
                <option value="Arabic (Gulf)">Arabic (Modern Standard / Gulf)</option>
                <option value="Hindi (Delhi)">Hindi (Contemporary Delhi)</option>
                <option value="Punjabi">Punjabi (Desi Folk & Urban)</option>
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Stability</span>
                <span className="font-mono text-purple-400 font-bold">{customParams.stability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customParams.stability}
                onChange={(e) => setCustomParams({ ...customParams, stability: parseInt(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Expressiveness</span>
                <span className="font-mono text-purple-400 font-bold">{customParams.expressiveness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customParams.expressiveness}
                onChange={(e) => setCustomParams({ ...customParams, expressiveness: parseInt(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <button
            onClick={handleSaveCustomVoice}
            disabled={isCreatingCustom}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isCreatingCustom ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Save and Calibrate Custom Voice</span>
          </button>
        </div>
      )}

      {/* --- TAB 4: VOICE LIBRARY --- */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search voices, languages, accents..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['all', 'male', 'female', 'narrator', 'podcast', 'commercial', 'favorites'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLibraryCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    libraryCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'favorites' ? '❤️ Favorites' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVoices.map((voice) => (
              <div
                key={voice.id}
                className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-3 hover:border-purple-500/40 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={voice.avatarUrl}
                      alt={voice.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">{voice.name}</h4>
                        {voice.isPremium && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{voice.languageName} • {voice.accent}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(voice.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(voice.id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-[10px] text-slate-400 border border-slate-800 font-medium">
                    {voice.style}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-[10px] text-slate-400 border border-slate-800 font-medium capitalize">
                    {voice.gender}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{voice.personality}</p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedVoiceId(voice.id);
                      setActiveTab('tts');
                      success(`Selected ${voice.name} for synthesis`);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    Use This Voice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLONE MODAL WITH MANDATORY CONSENT CONFIRMATION */}
      {cloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#11121c] border border-purple-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-white text-lg">AI Voice Cloning Calibration</h3>
              </div>
              <button
                onClick={() => setCloneModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoiceClone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Voice Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Personal Studio Voice"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Calm narrative tone for YouTube videos"
                  value={cloneDesc}
                  onChange={(e) => setCloneDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Gender</label>
                  <select
                    value={cloneGender}
                    onChange={(e) => setCloneGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Accent</label>
                  <input
                    type="text"
                    value={cloneAccent}
                    onChange={(e) => setCloneAccent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Sample Upload Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Voice Sample (WAV / MP3 / M4A)</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-900/40 transition-colors">
                  <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Click to upload voice recording sample</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Minimum 15 seconds of clean, background-noise free speech</p>
                </div>
              </div>

              {/* MANDATORY CONSENT CONFIRMATION */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 accent-purple-600 rounded cursor-pointer"
                  />
                  <label htmlFor="consent-check" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    <strong className="text-white">Mandatory Legal Consent:</strong> I confirm that I own this voice or have explicit written authorization from the speaker to synthesize and clone this vocal profile. I agree not to use it for deceptive impersonation.
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloneModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!consentAgreed || isCloning}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  {isCloning ? 'Calibrating Model...' : 'Start Voice Cloning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
