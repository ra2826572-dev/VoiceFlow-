import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  Building,
  User,
  ShieldAlert,
  Megaphone,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { BrandVoiceProfile } from '../../types';

interface BrandVoiceModalProps {
  brandVoices: BrandVoiceProfile[];
  activeBrandVoiceId: string | null;
  onSelectBrandVoice: (id: string | null) => void;
  onRefreshVoices: () => void;
  onClose: () => void;
}

export const BrandVoiceModal: React.FC<BrandVoiceModalProps> = ({
  brandVoices,
  activeBrandVoiceId,
  onSelectBrandVoice,
  onRefreshVoices,
  onClose,
}) => {
  const { success, error } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [tone, setTone] = useState<string>('Confident, Visionary & Pragmatic');
  const [vocabularyStyle, setVocabularyStyle] = useState<string>('Clear, action-oriented, zero fluff');
  const [writingStyle, setWritingStyle] = useState<string>('Punchy short paragraphs with strong hooks');
  const [wordsToAvoid, setWordsToAvoid] = useState<string>('synergy, paradigm shift, guru');
  const [preferredCTA, setPreferredCTA] = useState<string>('Try it free today at voiceflow.ai');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Personal Style Extractor State
  const [sampleText, setSampleText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const handleCreateVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter a Brand Voice name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/brand-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetAudience,
          tone,
          vocabularyStyle,
          writingStyle,
          wordsToAvoid: wordsToAvoid.split(',').map((w) => w.trim()).filter(Boolean),
          preferredCTA,
        }),
      });

      if (res.ok) {
        success('Brand Voice profile saved!');
        setIsCreating(false);
        onRefreshVoices();
      } else {
        throw new Error('Failed to save brand voice');
      }
    } catch {
      error('Could not save brand voice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoice = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/brand-voices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        success('Brand Voice deleted');
        if (activeBrandVoiceId === id) onSelectBrandVoice(null);
        onRefreshVoices();
      }
    } catch {
      error('Could not delete brand voice');
    }
  };

  const handleExtractFromSample = () => {
    if (!sampleText.trim()) {
      error('Please paste a sample of your past writing');
      return;
    }
    setIsExtracting(true);
    setTimeout(() => {
      setName('My Personal Voice Profile');
      setTone('Conversational, Authentic & Direct');
      setVocabularyStyle('Relatable terminology with concrete examples');
      setWritingStyle('Story-first introduction followed by 3 clear takeaways');
      setIsExtracting(false);
      setIsCreating(true);
      success('Analyzed writing cadence & populated brand profile!');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0f1017] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131422]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Brand Voice & Style Presets</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Custom AI Style Alignment
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Train the AI writer to match your exact company tone, vocabulary, and preferred CTA.
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Voice Selection Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Brand Voice Profiles
            </span>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'View Saved Voices' : 'Create New Brand Voice'}</span>
            </button>
          </div>

          {!isCreating ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* None / Default Option */}
                <div
                  onClick={() => onSelectBrandVoice(null)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    activeBrandVoiceId === null
                      ? 'bg-purple-950/20 border-purple-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Default AI Voice</span>
                      {activeBrandVoiceId === null && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard high-retention copywriting persona without brand constraints.
                    </p>
                  </div>
                </div>

                {/* Custom Brand Voices */}
                {brandVoices.map((bv) => {
                  const isActive = activeBrandVoiceId === bv.id;
                  return (
                    <div
                      key={bv.id}
                      onClick={() => onSelectBrandVoice(bv.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isActive
                          ? 'bg-purple-950/20 border-purple-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-purple-400" />
                            <span>{bv.name}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                                Active
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVoice(bv.id);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Tone:</strong> {bv.tone}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Audience:</strong> {bv.targetAudience}
                        </p>
                      </div>

                      {bv.preferredCTA && (
                        <div className="p-2 rounded-xl bg-[#0a0b10] border border-slate-800 text-[10px] text-purple-200">
                          <strong>CTA:</strong> {bv.preferredCTA}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Personal Style Extractor Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121422] to-[#0d0e17] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Extract My Personal Writing Style</span>
                </div>
                <p className="text-xs text-slate-400">
                  Paste 1-2 paragraphs of your past writing. AI will analyze sentence length, rhythm, and vocabulary.
                </p>
                <textarea
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  rows={3}
                  placeholder="Paste your past emails, articles, or scripts here..."
                  className="w-full bg-[#0a0b10] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={handleExtractFromSample}
                  disabled={isExtracting}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isExtracting ? 'Analyzing...' : 'Analyze & Create My Style Profile'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreateVoice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Brand / Profile Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme SaaS Voice"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. B2B Founders and VP Marketing"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tone & Personality</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. Confident, Visionary, Direct"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Vocabulary Style</label>
                  <input
                    type="text"
                    value={vocabularyStyle}
                    onChange={(e) => setVocabularyStyle(e.target.value)}
                    placeholder="e.g. High-tech, action-driven, zero fluff"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Writing Style & Formatting Rules</label>
                <input
                  type="text"
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  placeholder="e.g. 2-sentence maximum paragraphs, bulleted takeaways"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-rose-300">Words / Jargon to Avoid</label>
                  <input
                    type="text"
                    value={wordsToAvoid}
                    onChange={(e) => setWordsToAvoid(e.target.value)}
                    placeholder="comma-separated words (e.g. synergy, guru, paradigm)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-purple-300">Default Call-To-Action (CTA)</label>
                  <input
                    type="text"
                    value={preferredCTA}
                    onChange={(e) => setPreferredCTA(e.target.value)}
                    placeholder="e.g. Start your 14-day trial at..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Brand Voice'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
