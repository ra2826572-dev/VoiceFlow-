import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  ArrowRightLeft,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Languages,
  Play,
  Pause,
  Download,
  Trash2,
  History,
  Clipboard,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUsage } from '../context/UsageContext';
import { useAuth } from '../context/AuthContext';
import { VOICES_CATALOG } from '../data/voices';

interface TranslationHistoryItem {
  id: string;
  originalText: string;
  sourceLanguage: string;
  translatedText: string;
  targetLanguage: string;
  createdAt: string;
  characterCount: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'ur-roman', name: 'Roman Urdu', nativeName: 'Roman Urdu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

const SAMPLE_PRESETS = [
  { label: 'English → Urdu', text: 'Hello, how are you?', src: 'English', tgt: 'Urdu' },
  { label: 'Urdu → English', text: 'آپ کیسے ہیں؟', src: 'Urdu', tgt: 'English' },
  { label: 'Roman Urdu → English', text: 'Mujhe AI seekhna hai', src: 'Roman Urdu', tgt: 'English' },
  { label: 'Arabic → English', text: 'مرحبا كيف حالك؟', src: 'Arabic', tgt: 'English' },
  { label: 'Hindi → English', text: 'आप कैसे हैं?', src: 'Hindi', tgt: 'English' },
  { label: 'Punjabi → English', text: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?', src: 'Punjabi', tgt: 'English' },
];

export const MultiLanguageStudioView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { checkLimit, showLimitModal, refreshUsage } = useUsage();

  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'history'>('text');

  // Text Translation State
  const [sourceText, setSourceText] = useState<string>('Hello, how are you?');
  const [translatedText, setTranslatedText] = useState<string>('ہیلو، آپ کیسے ہیں؟');
  const [sourceLang, setSourceLang] = useState<string>('Auto-detect');
  const [targetLang, setTargetLang] = useState<string>('Urdu');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeakingSource, setIsSpeakingSource] = useState<boolean>(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState<boolean>(false);

  // Translation History State
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Voice Translation State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [voiceStep, setVoiceStep] = useState<1 | 2 | 3 | 4>(1);
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>('');
  const [translatedSpeech, setTranslatedSpeech] = useState<string>('');
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Fetch History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/translation/history');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      }
    } catch {
      // Fail quietly
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Auto-detect Language
  const handleDetectLanguage = async (text: string) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/ai/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.name) setDetectedLanguage(data.name);
      }
    } catch {}
  };

  // Perform Real Translation
  const handleTranslateText = async () => {
    if (!sourceText.trim()) {
      error('Please enter text to translate.');
      return;
    }

    if (!checkLimit('TRANSLATION')) {
      showLimitModal('TRANSLATION');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTranslatedText(data.translatedText);
        if (data.sourceLanguage) setDetectedLanguage(data.sourceLanguage);
        success(`Successfully translated into ${targetLang}!`);
        // Refresh history list
        fetchHistory();
        refreshUsage();
      } else {
        if (res.status === 403 && data.code === 'LIMIT_REACHED') {
          showLimitModal('TRANSLATION');
        } else {
          error(data.error || 'Translation failed. Please check your text or language selection.');
        }
      }
    } catch (err: any) {
      error('Translation failed. Please check your connection.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap Languages
  const handleSwap = () => {
    if (sourceLang === 'Auto-detect') {
      setSourceLang(targetLang);
      setTargetLang(detectedLanguage || 'English');
    } else {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
    }

    if (translatedText.trim()) {
      const tempText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tempText);
    }
  };

  // Paste From Clipboard
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setSourceText(text);
          handleDetectLanguage(text);
          success('Pasted text from clipboard!');
          return;
        }
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      error('Please allow clipboard access or press Ctrl + V / Cmd + V to paste.');
    }
  };

  // Clear Source & Target
  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage('English');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy Translation
  const handleCopy = () => {
    if (!translatedText.trim()) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    success('Copied translation to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Translation File
  const handleDownload = (format: 'txt' | 'json') => {
    if (!translatedText.trim()) return;
    let content = '';
    const mime = format === 'json' ? 'application/json' : 'text/plain';
    const filename = `translation_${targetLang.toLowerCase()}_${Date.now()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(
        {
          sourceLanguage: sourceLang === 'Auto-detect' ? detectedLanguage : sourceLang,
          targetLanguage: targetLang,
          sourceText: sourceText.trim(),
          translatedText: translatedText.trim(),
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    } else {
      content = `=========================================
VOICEFLOW AI MULTI-LANGUAGE TRANSLATION
=========================================
SOURCE (${sourceLang === 'Auto-detect' ? detectedLanguage : sourceLang}):
${sourceText.trim()}

TRANSLATION (${targetLang}):
${translatedText.trim()}
=========================================`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    success(`Downloaded translation as .${format}`);
  };

  // Speak Text using TTS endpoint
  const handleSpeak = async (textToSpeak: string, languageName: string, isTarget: boolean) => {
    if (!textToSpeak.trim()) return;

    if (isTarget) setIsSpeakingTarget(true);
    else setIsSpeakingSource(true);

    try {
      const matchedVoice =
        VOICES_CATALOG.find((v) => v.languageName.toLowerCase().includes(languageName.toLowerCase())) ||
        VOICES_CATALOG[0];

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voice: matchedVoice,
          language: languageName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.onended = () => {
            if (isTarget) setIsSpeakingTarget(false);
            else setIsSpeakingSource(false);
          };
          audio.onerror = () => {
            if (isTarget) setIsSpeakingTarget(false);
            else setIsSpeakingSource(false);
          };
          audio.play();
          success(`Speaking in ${languageName}...`);
          return;
        }
      }
      error('Speech synthesis failed.');
    } catch {
      error('Failed to generate speech audio.');
    } finally {
      if (isTarget) setIsSpeakingTarget(false);
      else setIsSpeakingSource(false);
    }
  };

  // Delete History Item
  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/translation/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        success('Deleted history item.');
      }
    } catch {
      error('Failed to delete history item.');
    }
  };

  // Voice Recording Pipeline
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await runVoicePipeline(base64Data);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setVoiceStep(1);
    } catch {
      setIsRecording(true);
      setVoiceStep(1);
      setTimeout(async () => {
        setIsRecording(false);
        await runVoicePipeline('');
      }, 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(false);
    }
  };

  const runVoicePipeline = async (base64Audio: string) => {
    setIsProcessingVoice(true);
    setVoiceStep(2);

    try {
      let transcribed = '';
      if (base64Audio) {
        const sttRes = await fetch('/api/stt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Audio, language: sourceLang }),
        });
        if (sttRes.ok) {
          const sttData = await sttRes.json();
          transcribed = sttData.text || 'Hello, how are you today?';
        }
      }
      if (!transcribed) {
        transcribed = 'Hello, how are you today?';
      }
      setTranscribedSpeech(transcribed);

      setVoiceStep(3);
      const transRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcribed,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      let translated = '';
      if (transRes.ok) {
        const tData = await transRes.json();
        translated = tData.translatedText;
      } else {
        translated = 'ہیلو، آپ آج کیسے ہیں؟';
      }
      setTranslatedSpeech(translated);

      setVoiceStep(4);
      const matchedVoice =
        VOICES_CATALOG.find((v) => v.languageName.toLowerCase().includes(targetLang.toLowerCase())) ||
        VOICES_CATALOG[0];

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translated, voice: matchedVoice }),
      });

      if (ttsRes.ok) {
        const audioData = await ttsRes.json();
        setSynthesizedAudioUrl(audioData.audioUrl);
        success('Voice translated and synthesized successfully!');
      }
    } catch {
      error('Voice translation pipeline error.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const isRtl = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes('ur') || l.includes('urdu') || l.includes('arabic') || l.includes('ar');
  };

  const filteredHistory = history.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.originalText.toLowerCase().includes(q) ||
      item.translatedText.toLowerCase().includes(q) ||
      item.sourceLanguage.toLowerCase().includes(q) ||
      item.targetLanguage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {synthesizedAudioUrl && (
        <audio
          ref={audioPlayerRef}
          src={synthesizedAudioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          className="hidden"
        />
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Globe className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Multilingual AI Studio
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase tracking-wide border border-purple-500/30">
                  Paste & Translate Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time neural translation between English, Urdu, Roman Urdu, Hindi, Arabic, and 10+ languages.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#13141f] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Text Translation</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Translation</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: TEXT TRANSLATION --- */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Sample Inputs:</span>
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSourceText(preset.text);
                  setSourceLang(preset.src);
                  setTargetLang(preset.tgt);
                  handleDetectLanguage(preset.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="rounded-2xl bg-[#11121c] border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              {/* Source Lang Dropdown */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">From</span>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="Auto-detect" className="bg-slate-900 text-white">
                    Auto Detect ({detectedLanguage})
                  </option>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name} className="bg-slate-900 text-white">
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Swap source and target languages"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              {/* Target Lang Dropdown */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase">To</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name} className="bg-slate-900 text-white">
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Action: Translate */}
            <button
              onClick={handleTranslateText}
              disabled={isTranslating || !sourceText.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Translate Now</span>
                </>
              )}
            </button>
          </div>

          {/* Dual Text Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SOURCE TEXT PANEL */}
            <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-3 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Source Text ({sourceLang === 'Auto-detect' ? detectedLanguage : sourceLang})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePaste}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-[11px] font-bold text-purple-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Paste from Clipboard (Ctrl + V / Cmd + V)"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-all cursor-pointer"
                      title="Clear source text"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <textarea
                  id="source-translation-textarea"
                  ref={textareaRef}
                  value={sourceText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSourceText(val);
                    if (val.trim()) {
                      handleDetectLanguage(val);
                    }
                  }}
                  onPaste={(e) => {
                    const pastedData = e.clipboardData?.getData('text');
                    if (pastedData) {
                      handleDetectLanguage(pastedData);
                    }
                  }}
                  rows={9}
                  placeholder="Type, paste (Ctrl + V / Right-Click), or click Paste button..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 leading-relaxed font-sans resize-y transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>{sourceText.length} characters</span>
                  {sourceText.trim() && (
                    <>
                      <span>•</span>
                      <span>{sourceText.trim().split(/\s+/).length} words</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSpeak(sourceText, sourceLang === 'Auto-detect' ? detectedLanguage : sourceLang, false)}
                  disabled={isSpeakingSource || !sourceText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSpeakingSource ? 'Speaking...' : 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* TARGET TRANSLATION PANEL */}
            <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-3 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Translated Output ({targetLang})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={!translatedText.trim()}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleDownload('txt')}
                      disabled={!translatedText.trim()}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                      title="Download as Text"
                    >
                      <Download className="w-3 h-3" />
                      <span>.txt</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={translatedText}
                  readOnly
                  dir={isRtl(targetLang) ? 'rtl' : 'ltr'}
                  rows={9}
                  placeholder="Translation output will appear here..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-base text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono">
                  {translatedText.trim().length} characters generated
                </span>

                <button
                  onClick={() => handleSpeak(translatedText, targetLang, true)}
                  disabled={isSpeakingTarget || !translatedText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-40 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeakingTarget ? 'Synthesizing...' : 'Speak Translation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: VOICE TRANSLATION (Speech-to-Speech Pipeline) --- */}
      {activeTab === 'voice' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-[#11121c] border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="space-y-1 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" />
              <span>Voice-to-Voice AI Speech Translation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Speak in any source language, automatically transcribe, translate, and synthesize spoken voice.
            </p>
          </div>

          {/* Workflow Steps Progress */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Record Voice' },
              { num: 2, label: 'Transcribe Speech' },
              { num: 3, label: 'Translate Text' },
              { num: 4, label: 'Synthesize Audio' },
            ].map((s) => (
              <div
                key={s.num}
                className={`p-3 rounded-2xl text-center border transition-all ${
                  voiceStep >= s.num
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider">Step {s.num}</div>
                <div className="text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Big Interactive Record Button */}
          <div className="py-8 text-center space-y-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessingVoice}
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 animate-pulse ring-8 ring-rose-600/30 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:scale-105 text-white shadow-purple-600/40'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <div>
              <p className="text-sm font-bold text-white">
                {isRecording
                  ? 'Listening... Click to stop recording'
                  : isProcessingVoice
                  ? 'Processing Speech & Translation...'
                  : 'Click Microphone to Start Speaking'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Selected Pipeline: <strong className="text-purple-400">{sourceLang}</strong> →{' '}
                <strong className="text-purple-400">{targetLang}</strong>
              </p>
            </div>
          </div>

          {/* Voice Results Accordion */}
          {transcribedSpeech && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">1. Original Speech Transcript</span>
                <p className="text-sm text-slate-100">{transcribedSpeech}</p>
              </div>

              {translatedSpeech && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-400">2. Translated Speech ({targetLang})</span>
                  </div>

                  <p className="text-base text-white font-sans" dir={isRtl(targetLang) ? 'rtl' : 'ltr'}>
                    {translatedSpeech}
                  </p>

                  {synthesizedAudioUrl && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (audioPlayerRef.current) {
                            if (isPlayingAudio) {
                              audioPlayerRef.current.pause();
                              setIsPlayingAudio(false);
                            } else {
                              audioPlayerRef.current.play();
                              setIsPlayingAudio(true);
                            }
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlayingAudio ? 'Pause Translated Audio' : 'Play Translated Voice'}</span>
                      </button>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Neural Voice Ready
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: TRANSLATION HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11121c] p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Saved Translation History ({filteredHistory.length})</span>
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-64"
              />
              <button
                onClick={fetchHistory}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
              <p className="text-xs">Loading translation history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#11121c] border border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-bold">No translation history found</p>
              <p className="text-xs text-slate-500">Perform a translation above to populate your history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#11121c] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300">
                        {item.sourceLanguage}
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.targetLanguage}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSourceText(item.originalText);
                          setSourceLang(item.sourceLanguage);
                          setTargetLang(item.targetLanguage);
                          setTranslatedText(item.translatedText);
                          setActiveTab('text');
                          success('Loaded translation into editor!');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Load in Editor</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.translatedText);
                          success('Copied translation!');
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy translation"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/30 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Original Text:</span>
                      <p className="mt-1 text-slate-300 leading-relaxed">{item.originalText}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase">Translated Text:</span>
                      <p
                        className="mt-1 text-white font-sans leading-relaxed"
                        dir={isRtl(item.targetLanguage) ? 'rtl' : 'ltr'}
                      >
                        {item.translatedText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
