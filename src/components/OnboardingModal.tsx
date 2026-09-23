import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Globe,
  Mic,
  Video,
  Play,
  RotateCw,
  FolderPlus,
  X,
  Volume2,
} from 'lucide-react';
import { VOICES_CATALOG } from '../data/voices';
import { playVoiceSpeechPreview } from '../utils/audioSynth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (projectData: { name: string; script: string; voiceId: string; language: string }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user, updateProfile } = useAuth();
  const { success } = useToast();

  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState('YouTube Videos');
  const [selectedLanguage, setSelectedLanguage] = useState('ur');
  const [selectedVoiceId, setSelectedVoiceId] = useState('zara-urdu-natural');
  const [projectName, setProjectName] = useState('My First AI Audio');
  const [initialScript, setInitialScript] = useState(
    'وائس فلو اے آئی میں خوش آمدید۔ مصنوعی ذہانت کے ساتھ اپنے الفاظ کو قدرتی اور پرکشش آواز میں تبدیل کریں۔'
  );
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const creationGoals = [
    { id: 'youtube', label: 'YouTube Videos', desc: 'Narrations, explainer videos & long-form voiceovers' },
    { id: 'reels', label: 'Reels & TikTok', desc: 'Fast, viral hooks with punchy vocal delivery' },
    { id: 'podcasts', label: 'Podcasts & Dialogue', desc: 'Multi-character episodic discussions' },
    { id: 'audiobooks', label: 'Audiobooks & Stories', desc: 'Deep storytelling with emotional intonation' },
    { id: 'commercials', label: 'Ad Copy & Commercials', desc: 'High-energy sales voiceovers for brands' },
    { id: 'translation', label: 'Multi-Language Translation', desc: 'Neural translation across 15+ languages' },
  ];

  const languages = [
    { code: 'ur', name: 'Urdu (اردو)' },
    { code: 'ur-roman', name: 'Roman Urdu' },
    { code: 'en', name: 'English (US & Global)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ar', name: 'Arabic (العربية)' },
    { code: 'es', name: 'Spanish (Español)' },
  ];

  const candidateVoices = VOICES_CATALOG.filter((v) =>
    selectedLanguage === 'ur-roman' ? v.language === 'ur' || v.language === 'ur-roman' : v.language === selectedLanguage
  ).slice(0, 4);

  const handlePreview = async (voiceId: string) => {
    const voice = VOICES_CATALOG.find((v) => v.id === voiceId);
    if (!voice) return;
    setPreviewingVoiceId(voiceId);
    const sample =
      voice.language === 'ur'
        ? 'وائس فلو کے ساتھ قدرتی آواز کا تجربہ کریں۔'
        : `Hello, this is ${voice.name} for your upcoming audio project.`;
    try {
      await playVoiceSpeechPreview(sample, voice);
    } catch {}
    setPreviewingVoiceId(null);
  };

  const handleFinish = async () => {
    await updateProfile({
      preferredLanguage: selectedLanguage as any,
      preferredVoiceId: selectedVoiceId,
    });
    success('Welcome to your personalized studio workspace!');
    onComplete({
      name: projectName,
      script: initialScript,
      voiceId: selectedVoiceId,
      language: selectedLanguage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#131422] to-[#0c0d16] border border-purple-500/30 shadow-2xl space-y-6 text-slate-200">
        {/* Top Progress & Skip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              Step {step} of 4
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    s <= step ? 'bg-purple-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip to Studio
          </button>
        </div>

        {/* STEP 1: What do you want to create? */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                What do you want to create?
              </h2>
              <p className="text-xs text-slate-400">
                We'll optimize your studio toolset and default prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {creationGoals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.label)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedGoal === g.label
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{g.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preferred Language */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Choose your primary language
              </h2>
              <p className="text-xs text-slate-400">
                You can always switch or translate scripts at any point.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLanguage(l.code)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedLanguage === l.code
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{l.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Neural synthesis enabled</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preferred Voice */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Select your starter voice
              </h2>
              <p className="text-xs text-slate-400">
                Listen to realistic voice previews and pick your favorite.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(candidateVoices.length > 0 ? candidateVoices : VOICES_CATALOG.slice(0, 4)).map((v) => {
                const isSelected = selectedVoiceId === v.id;
                const isPreviewing = previewingVoiceId === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoiceId(v.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={v.avatarUrl}
                        alt={v.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{v.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {v.languageName} • {v.style} ({v.gender})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(v.id);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Preview Voice"
                    >
                      {isPreviewing ? (
                        <RotateCw className="w-4 h-4 animate-spin text-purple-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: First Project */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Launch your first project
              </h2>
              <p className="text-xs text-slate-400">
                Give your project a title and customize your opening script.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Project Title</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Starter Script</label>
                <textarea
                  rows={3}
                  value={initialScript}
                  onChange={(e) => setInitialScript(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-serif"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/40 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open in Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
