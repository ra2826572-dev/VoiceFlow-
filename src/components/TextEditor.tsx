import React, { useState, useEffect } from 'react';
import {
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Sparkles,
  Globe,
  AlignRight,
  AlignLeft,
  Check,
  RotateCw,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/voices';
import { LanguageCode } from '../types';
import { useToast } from '../context/ToastContext';

interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onGenerateVoice: () => void;
  isGenerating?: boolean;
  className?: string;
  id?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  selectedLanguage,
  onLanguageChange,
  onGenerateVoice,
  isGenerating = false,
  className = '',
  id = 'studio-text-editor',
}) => {
  const { success, info } = useToast();
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [autoSaved, setAutoSaved] = useState(true);

  // Check if current text or language requires RTL layout
  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
  const isRtl = Boolean(
    currentLangInfo?.isRtl ||
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value)
  );

  // Update history on edit
  const handleTextChange = (newVal: string) => {
    onChange(newVal);
    setAutoSaved(false);

    // Save to history stack with debounce
    if (newVal !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newVal);
      // Keep max 30 history states
      if (newHistory.length > 30) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSaved(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [value]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      onChange(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      onChange(history[nextIndex]);
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    success('Text copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    if (!value) return;
    handleTextChange('');
    info('Editor cleared');
  };

  const handleLoadSample = (sample: string, lang: LanguageCode) => {
    onLanguageChange(lang);
    handleTextChange(sample);
  };

  // Word and character counts
  const safeValue = typeof value === 'string' ? value : '';
  const charCount = safeValue.length;
  const wordCount = safeValue.trim() ? safeValue.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingSeconds = Math.max(1, Math.round((wordCount / 145) * 60));

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-2.5 pointer-events-none" />
            <select
              id="editor-language-select"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="pl-8 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-xs"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Quick preset samples pills */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            <button
              onClick={() =>
                handleLoadSample(
                  'وائس فلو اے آئی میں خوش آمدید۔ جدید مصنوعی ذہانت کے ساتھ اپنے الفاظ کو خوبصورت اور قدرتی آواز میں تبدیل کریں۔',
                  'ur'
                )
              }
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              Urdu Demo
            </button>
            <button
              onClick={() =>
                handleLoadSample(
                  'VoiceFlow AI gives your words a natural, human-like voice with next-generation AI speech synthesis.',
                  'en'
                )
              }
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              English Demo
            </button>
          </div>
        </div>

        {/* Action Toolbar buttons */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            id="editor-btn-undo"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            id="editor-btn-redo"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            id="editor-btn-copy"
            onClick={handleCopy}
            disabled={!value}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Copy Text"
            aria-label="Copy Text"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            id="editor-btn-clear"
            onClick={handleClear}
            disabled={!value}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-rose-500 disabled:opacity-40 transition-colors"
            title="Clear Text"
            aria-label="Clear Text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Textarea with proper RTL support */}
      <div className="relative flex-1 p-4 min-h-[220px] flex flex-col">
        <textarea
          id="studio-main-textarea"
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            isRtl
              ? 'یہاں اپنا متن لکھیں یا پیسٹ کریں اور آواز بنائیں...'
              : 'Type, paste, or dictate your text here to convert into natural AI voice...'
          }
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`w-full flex-1 bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-base leading-relaxed ${
            isRtl ? 'font-rtl text-right text-lg' : 'font-sans text-left'
          }`}
        />

        {/* RTL indicator badge if active */}
        {isRtl && (
          <div className="absolute top-2 right-4 pointer-events-none opacity-40 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <AlignRight className="w-3 h-3" />
            <span>RTL Mode</span>
          </div>
        )}
      </div>

      {/* Bottom Status & Generate Action Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
        {/* Statistics & Auto-save status */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">{wordCount}</strong> words
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">{charCount}</strong> characters
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="hidden sm:inline-block">
            Est. ~{estimatedReadingSeconds}s audio
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {autoSaved ? '✓ Saved' : 'Saving...'}
          </span>
        </div>

        {/* Generate Voice Button */}
        <button
          id="btn-generate-voice"
          onClick={onGenerateVoice}
          disabled={!value.trim() || isGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-600/25 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-white" />
              <span>Creating your voice...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Generate Voice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
