import React, { useState } from 'react';
import {
  Search,
  Filter,
  Volume2,
  Sparkles,
  Check,
  UserCheck,
  RotateCw,
  Trash2,
  RotateCcw,
  PlusCircle,
  Star,
  Mic,
} from 'lucide-react';
import { Voice, VoiceGender, LanguageCode } from '../types';
import { VOICES_CATALOG } from '../data/voices';
import { playVoiceSpeechPreview } from '../utils/audioSynth';
import { useToast } from '../context/ToastContext';
import { AddVoiceModal } from './AddVoiceModal';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voice: Voice) => void;
  languageFilter?: LanguageCode;
  className?: string;
  id?: string;
}

type CategoryTab = 'all' | 'custom' | 'ur' | 'en' | 'hi' | 'ar' | 'pa' | 'other';

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
  languageFilter,
  className = '',
  id = 'voice-selector',
}) => {
  const { info, success } = useToast();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | VoiceGender>('all');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('all');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);

  // Custom User Voices loaded from localStorage
  const [customVoices, setCustomVoices] = useState<Voice[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceflow_custom_voices');
        return saved ? JSON.parse(saved) : [];
      } catch {}
    }
    return [];
  });

  // Deleted Voice IDs (can delete any voice)
  const [deletedVoiceIds, setDeletedVoiceIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceflow_deleted_voice_ids');
        return saved ? JSON.parse(saved) : [];
      } catch {}
    }
    return [];
  });

  // Combine custom voices with the curated 150 voices
  const allCombinedVoices: Voice[] = [...customVoices, ...VOICES_CATALOG];

  const availableVoices = allCombinedVoices.filter(
    (voice) => !deletedVoiceIds.includes(voice.id)
  );

  const filteredVoices = availableVoices.filter((voice) => {
    // Category tab filter
    if (categoryTab === 'custom') {
      if (!voice.isCustom) return false;
    } else if (categoryTab === 'ur') {
      if (voice.language !== 'ur' && voice.language !== 'ur-roman') return false;
    } else if (categoryTab === 'en') {
      if (voice.language !== 'en') return false;
    } else if (categoryTab === 'hi') {
      if (voice.language !== 'hi') return false;
    } else if (categoryTab === 'ar') {
      if (voice.language !== 'ar') return false;
    } else if (categoryTab === 'pa') {
      if (voice.language !== 'pa') return false;
    } else if (categoryTab === 'other') {
      const mainLangs = ['ur', 'ur-roman', 'en', 'hi', 'ar', 'pa'];
      if (mainLangs.includes(voice.language)) return false;
    }

    // Direct language filter prop if passed and tab is 'all'
    if (languageFilter && categoryTab === 'all' && voice.language !== languageFilter) {
      const isUrduRelated =
        (languageFilter === 'ur' && voice.language === 'ur-roman') ||
        (languageFilter === 'ur-roman' && voice.language === 'ur');
      if (!isUrduRelated) return false;
    }

    // Gender filter
    if (genderFilter !== 'all' && voice.gender !== genderFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        voice.name.toLowerCase().includes(q) ||
        voice.personality.toLowerCase().includes(q) ||
        voice.accent.toLowerCase().includes(q) ||
        voice.languageName.toLowerCase().includes(q) ||
        voice.style.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDeleteVoice = (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    if (voice.isCustom) {
      // Remove from custom voices
      const updated = customVoices.filter((v) => v.id !== voice.id);
      setCustomVoices(updated);
      try {
        localStorage.setItem('voiceflow_custom_voices', JSON.stringify(updated));
      } catch {}
      info(`Custom voice "${voice.name}" deleted.`);
    } else {
      // Mark as deleted in list
      const updated = [...deletedVoiceIds, voice.id];
      setDeletedVoiceIds(updated);
      try {
        localStorage.setItem('voiceflow_deleted_voice_ids', JSON.stringify(updated));
      } catch {}
      info(`Voice "${voice.name}" removed from your list.`);
    }

    // If currently selected, select another voice
    if (selectedVoiceId === voice.id) {
      const nextVoice = availableVoices.find((v) => v.id !== voice.id);
      if (nextVoice) {
        onSelectVoice(nextVoice);
      }
    }
  };

  const handleRestoreVoices = () => {
    setDeletedVoiceIds([]);
    try {
      localStorage.removeItem('voiceflow_deleted_voice_ids');
    } catch {}
    success('All deleted voices have been restored!');
  };

  const handleVoiceAdded = (newVoice: Voice) => {
    setCustomVoices((prev) => [newVoice, ...prev]);
    onSelectVoice(newVoice);
    setCategoryTab('custom');
  };

  const handlePreview = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();
    if (previewingVoiceId === voice.id) return;

    // If custom voice with recorded audio URL, play directly
    if (voice.customAudioUrl) {
      setPreviewingVoiceId(voice.id);
      try {
        const audio = new Audio(voice.customAudioUrl);
        audio.onended = () => setPreviewingVoiceId(null);
        audio.onerror = () => setPreviewingVoiceId(null);
        await audio.play();
      } catch {
        setPreviewingVoiceId(null);
      }
      return;
    }

    setPreviewingVoiceId(voice.id);

    const sampleText =
      voice.language === 'ur'
        ? 'یہ وائس فلو اے آئی کی قدرتی آواز کا نمونہ ہے۔'
        : voice.language === 'ur-roman'
        ? 'Yeh VoiceFlow AI ki qudrati aawaz ka preview hai.'
        : voice.language === 'ar'
        ? 'هذا نموذج صوتي طبيعي من فويس فلو.'
        : voice.language === 'hi'
        ? 'यह वॉयسफ़्लो एआई की प्राकृतिक आवाज़ का पूर्वावलोकन है।'
        : `Hi, I am ${voice.name}. This is how I sound with VoiceFlow AI.`;

    try {
      await playVoiceSpeechPreview(sampleText, voice);
    } catch {
      // ignore
    } finally {
      setPreviewingVoiceId(null);
    }
  };

  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {/* Top Action Bar: Add Your Voice Button & Count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Voice Library
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-semibold font-mono">
            {availableVoices.length} Voices
          </span>
        </div>

        {/* Add Voice CTA Button */}
        <button
          type="button"
          onClick={() => setShowAddVoiceModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs shadow-purple-500/20 transition-transform active:scale-95 cursor-pointer shrink-0"
          title="Record or upload your voice"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Your Voice</span>
        </button>
      </div>

      {/* Search and Gender Filter Header */}
      <div className="space-y-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-voices"
            type="text"
            placeholder="Search 150+ voices by name, accent, style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Language Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryTab('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({allCombinedVoices.length})
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('custom')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 flex items-center gap-1 transition-colors ${
              categoryTab === 'custom'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>My Voices ({customVoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('ur')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'ur'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Urdu (25)
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('en')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'en'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            English (45)
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('hi')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'hi'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hindi (20)
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('ar')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'ar'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Arabic (15)
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('pa')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'pa'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Punjabi (10)
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('other')}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
              categoryTab === 'other'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            More (35)
          </button>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setGenderFilter('all')}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Genders
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('female')}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'female'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Female
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('male')}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
              genderFilter === 'male'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Male
          </button>
        </div>
      </div>

      {/* Voice Cards List (Single column with ample width, no cramped overlapping) */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {/* If Custom Voices tab selected and empty, prompt to add */}
        {categoryTab === 'custom' && customVoices.length === 0 && (
          <div className="p-6 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 text-center space-y-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                No Custom Voices Added Yet
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                Record your voice with your mic or upload an audio file to clone your unique voice.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVoiceModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              + Add Your First Voice Now
            </button>
          </div>
        )}

        {filteredVoices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPreviewing = previewingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              id={`voice-card-${voice.id}`}
              onClick={() => onSelectVoice(voice)}
              className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800/60 shadow-2xs'
              }`}
            >
              {/* Left Side: Avatar + Voice Meta */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Voice Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={voice.avatarUrl}
                    alt={voice.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {voice.isCustom && (
                    <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] shadow-xs" title="Custom Voice">
                      ★
                    </span>
                  )}
                </div>

                {/* Voice Information (cleanly stacked, no overflow) */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {voice.name}
                    </h4>
                    {voice.isCustom ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0">
                        My Voice
                      </span>
                    ) : (
                      voice.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shrink-0">
                          {voice.badge}
                        </span>
                      )
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {voice.languageName} • <span className="capitalize">{voice.gender}</span> • {voice.accent}
                  </p>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {voice.personality}
                  </p>
                </div>
              </div>

              {/* Right Side Action Buttons: Preview & Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  id={`btn-preview-${voice.id}`}
                  type="button"
                  onClick={(e) => handlePreview(e, voice)}
                  disabled={isPreviewing}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                  title="Preview voice speech"
                  aria-label={`Preview voice ${voice.name}`}
                >
                  {isPreviewing ? (
                    <RotateCw className="w-4 h-4 animate-spin text-purple-600" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  id={`btn-delete-voice-${voice.id}`}
                  type="button"
                  onClick={(e) => handleDeleteVoice(e, voice)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                  title={voice.isCustom ? `Delete custom voice ${voice.name}` : `Remove voice ${voice.name} from list`}
                  aria-label={`Delete voice ${voice.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restore Bar if any voices were removed */}
      {deletedVoiceIds.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/50 text-xs">
          <span className="text-slate-600 dark:text-slate-300">
            {deletedVoiceIds.length} voice{deletedVoiceIds.length > 1 ? 's' : ''} hidden
          </span>
          <button
            type="button"
            onClick={handleRestoreVoices}
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore All</span>
          </button>
        </div>
      )}

      {filteredVoices.length === 0 && categoryTab !== 'custom' && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No voices match your search or filter criteria.
        </div>
      )}

      {/* Add Custom Voice Modal */}
      <AddVoiceModal
        isOpen={showAddVoiceModal}
        onClose={() => setShowAddVoiceModal(false)}
        onVoiceAdded={handleVoiceAdded}
      />
    </div>
  );
};
