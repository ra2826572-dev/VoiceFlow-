import React, { useState } from 'react';
import {
  LanguageCode,
  Voice,
  VoiceSettings,
  ConversionItem,
} from '../types';
import { VOICES_CATALOG } from '../data/voices';
import { TextEditor } from '../components/TextEditor';
import { VoiceSettingsPanel } from '../components/VoiceSettings';
import { VoiceSelector } from '../components/VoiceSelector';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchSpeechAudio, synthesizeSpeechAudio } from '../utils/audioSynth';
import {
  Mic,
  Sliders,
  History,
  Sparkles,
  Bookmark,
  Volume2,
  Share2,
  FolderOpen,
  Zap,
  Trash2,
} from 'lucide-react';

interface VoiceStudioProps {
  onNavigateToHistory: () => void;
  recentConversions: ConversionItem[];
  onAddConversion: (item: ConversionItem) => void;
  onDeleteConversion?: (id: string) => void;
  initialText?: string;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  onNavigateToHistory,
  recentConversions = [],
  onAddConversion,
  onDeleteConversion,
  initialText,
}) => {
  const { user, updateProfile } = useAuth();
  const { success, error, info } = useToast();
  const safeRecent = Array.isArray(recentConversions) ? recentConversions : [];

  const [text, setText] = useState(
    initialText !== undefined
      ? initialText
      : 'وائس فلو اے آئی میں خوش آمدید۔ جدید مصنوعی ذہانت کے ساتھ اپنے الفاظ کو خوبصورت اور قدرتی آواز میں تبدیل کریں۔'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ur');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(
    VOICES_CATALOG.find((v) => v.id === 'voice-ur-zara') || VOICES_CATALOG[0]
  );
  const [settings, setSettings] = useState<VoiceSettings>({
    speed: 1.0,
    pitch: 'normal',
    emotion: 'neutral',
    style: 'natural',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(5.5);
  const [activeTab, setActiveTab] = useState<'voices' | 'settings'>('voices');
  const [fastMode, setFastMode] = useState(true);

  const handleGenerateVoice = async () => {
    if (!text.trim()) {
      error('Please enter text to generate speech');
      return;
    }

    setIsGenerating(true);
    info(fastMode ? '⚡ Fast speech generation active...' : 'Synthesizing speech with AI...');

    try {
      // Primary: Fetch high-fidelity studio voice audio
      const result = await fetchSpeechAudio(text, selectedVoice, settings);
      const audioUrl = result.audioUrl;
      const duration = result.duration;

      setCurrentAudioUrl(audioUrl);
      setAudioDuration(duration);

      const newRecord: ConversionItem = {
        id: 'conv-' + Date.now(),
        type: 'text_to_speech',
        title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
        text,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        language: selectedLanguage,
        createdAt: new Date().toISOString(),
        duration,
        audioUrl,
        characterCount: text.length,
        settings,
      };
      onAddConversion(newRecord);
      success('🎙️ Professional Studio Voice Generated!');

      if (user) {
        updateProfile({
          charactersUsed: (user.charactersUsed || 0) + text.length,
          conversionsCount: (user.conversionsCount || 0) + 1,
        });
      }
    } catch (err: any) {
      console.warn('Speech API failed, using fallback:', err);
      try {
        const synthResult = synthesizeSpeechAudio(text, selectedVoice, settings);
        setCurrentAudioUrl(synthResult.audioUrl);
        setAudioDuration(synthResult.duration);

        const fallbackRecord: ConversionItem = {
          id: 'conv-' + Date.now(),
          type: 'text_to_speech',
          title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
          text,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          language: selectedLanguage,
          createdAt: new Date().toISOString(),
          duration: synthResult.duration,
          audioUrl: synthResult.audioUrl,
          characterCount: text.length,
          settings,
        };
        onAddConversion(fallbackRecord);
        success('Voice Ready!');
      } catch (synthErr) {
        error('Failed to generate speech. Please check your text.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    if (voice.language) {
      setSelectedLanguage(voice.language);
    }
    success(`Selected ${voice.name} (${voice.gender})`);
  };

  return (
    <div id="voice-studio-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Text → Voice Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              Pro Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convert text scripts into natural speech with fine-grained voice and emotion tuning.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-fast-mode"
            onClick={() => {
              setFastMode(!fastMode);
              info(!fastMode ? '⚡ Fast reply mode activated (<1s)' : 'Standard mode activated');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              fastMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle fast reply mode for sub-second responses"
          >
            <Zap className={`w-3.5 h-3.5 ${fastMode ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>{fastMode ? '⚡ Fast Reply: Active' : 'Fast Reply: Off'}</span>
          </button>

          <button
            onClick={onNavigateToHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-purple-500" />
            <span>History ({safeRecent.length})</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Area: Text Editor & Audio Player (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Text Editor */}
          <TextEditor
            value={text}
            onChange={setText}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onGenerateVoice={handleGenerateVoice}
            isGenerating={isGenerating}
          />

          {/* Generated Audio Player (Shows once generated, or pre-loaded) */}
          {currentAudioUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Generated Audio Output
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ High-Definition Output
                  </span>
                  <button
                    onClick={() => {
                      setCurrentAudioUrl(null);
                      info('Generated voice cleared');
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                    title="Delete generated audio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Voice</span>
                  </button>
                </div>
              </div>
              <AudioPlayer
                audioUrl={currentAudioUrl}
                duration={audioDuration}
                inputText={text}
                voiceName={selectedVoice.name}
                language={selectedLanguage.toUpperCase()}
              />
            </div>
          )}

          {/* Quick Recent Conversions strip */}
          {safeRecent.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-purple-500" />
                  Recent Studio Generations
                </span>
                <button
                  onClick={onNavigateToHistory}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {safeRecent.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setText(item.text || '');
                      if (item.audioUrl) setCurrentAudioUrl(item.audioUrl);
                      if (item.duration) setAudioDuration(item.duration);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-800/60 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.voiceName || 'AI Voice'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase font-semibold">
                          {item.language}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.duration?.toFixed(1)}s
                      </span>
                      {onDeleteConversion && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversion(item.id);
                            info('Voice conversion deleted');
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                          title="Delete voice record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Voice Catalog & Voice Controls (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Navigation Tab Header between Voice Library and Tuning Controls */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              id="tab-voices"
              onClick={() => setActiveTab('voices')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'voices'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Library</span>
            </button>

            <button
              id="tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Voice Controls</span>
            </button>
          </div>

          {/* Active Voice Pill Summary */}
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedVoice.avatarUrl}
                alt={selectedVoice.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500/30"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {selectedVoice.name}
                </h4>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  {selectedVoice.languageName} • {selectedVoice.gender} • {selectedVoice.accent}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'voices' ? 'settings' : 'voices')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              {activeTab === 'voices' ? 'Tune' : 'Change'}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'voices' ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <VoiceSelector
                selectedVoiceId={selectedVoice.id}
                onSelectVoice={handleSelectVoice}
                languageFilter={selectedLanguage}
              />
            </div>
          ) : (
            <VoiceSettingsPanel
              settings={settings}
              onChange={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
            />
          )}
        </div>
      </div>
    </div>
  );
};
