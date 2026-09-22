import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Sparkles,
  Check,
  User,
  Music,
  Radio,
  Volume2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Voice, VoiceGender, LanguageCode, VoiceStyle } from '../types';
import { useToast } from '../context/ToastContext';

interface AddVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceAdded: (voice: Voice) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export const AddVoiceModal: React.FC<AddVoiceModalProps> = ({
  isOpen,
  onClose,
  onVoiceAdded,
}) => {
  const { success, error, info } = useToast();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<VoiceGender>('male');
  const [language, setLanguage] = useState<LanguageCode>('ur');
  const [style, setStyle] = useState<VoiceStyle>('conversational');
  const [accent, setAccent] = useState('Lahori Warm');
  const [personality, setPersonality] = useState('Warm, Natural & Clear');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[1]);

  // Audio source tabs: 'record' | 'upload'
  const [sourceType, setSourceType] = useState<'record' | 'upload'>('record');

  // Live recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        error('Microphone access is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      info('Recording started... Speak your sample clearly into your microphone.');
    } catch (err: any) {
      error('Could not access microphone: ' + (err.message || 'Permission denied'));
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      error('Please select an audio file (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAudioUrl(reader.result as string);
      info(`Loaded audio file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const togglePlayPreview = () => {
    if (!audioUrl) return;

    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.src = audioUrl;
    }

    previewAudioRef.current
      .play()
      .then(() => setIsPlayingPreview(true))
      .catch(() => setIsPlayingPreview(false));
  };

  const handleSaveVoice = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      error('Please enter a name for your custom voice');
      return;
    }

    const langNames: Record<string, string> = {
      ur: 'Urdu',
      'ur-roman': 'Roman Urdu',
      en: 'English',
      hi: 'Hindi',
      ar: 'Arabic',
      pa: 'Punjabi',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      tr: 'Turkish',
    };

    const newVoice: Voice = {
      id: `custom-voice-${Date.now()}`,
      name: trimmedName,
      gender,
      language,
      languageName: langNames[language] || 'Custom',
      accent: accent.trim() || 'Custom Dialect',
      style,
      personality: personality.trim() || 'Natural & Personalized',
      avatarUrl: selectedAvatar,
      previewAudioUrl: audioUrl || undefined,
      customAudioUrl: audioUrl || undefined,
      badge: 'My Voice',
      isCustom: true,
      isPremium: false,
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem('voiceflow_custom_voices');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newVoice);
      localStorage.setItem('voiceflow_custom_voices', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    onVoiceAdded(newVoice);
    success(`Custom Voice "${newVoice.name}" added successfully!`);
    onClose();
  };

  return (
    <div
      id="add-voice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRecording) onClose();
      }}
    >
      <div
        id="add-voice-modal-dialog"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add / Clone Your Own Voice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اپنی آواز شامل کریں - Create a personalized AI voice model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRecording}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Voice Sample Source (Record or Upload) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Voice Sample Input</span>
              <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">
                {audioUrl ? '✓ Audio Sample Loaded' : 'Record 5–10 seconds of clear speech'}
              </span>
            </label>

            {/* Source Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setSourceType('record')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'record'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Microphone Record</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio File</span>
              </button>
            </div>

            {/* Recording Controls */}
            {sourceType === 'record' ? (
              <div className="p-4 rounded-2xl border border-dashed border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col items-center justify-center text-center gap-3">
                {isRecording ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                        Recording: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </span>
                    </div>

                    {/* Animated Waveform Indicator */}
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                        <div
                          key={bar}
                          className="w-1.5 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.max(12, Math.sin(bar + recordingSeconds) * 28 + 16)}px`,
                            animationDelay: `${bar * 100}ms`,
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      "VoiceFlow AI mein meri aawaz shaamil karein..."
                    </p>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop & Use Recording</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tap to Start Recording (5-15s)
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Read any sentence naturally in Urdu or English to capture your voice timber.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* File Upload Area */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/50 dark:bg-slate-800/40 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-7 h-7 mx-auto text-purple-500 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click or drag audio file to upload
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports MP3, WAV, M4A, OGG or WEBM voice recordings
                </p>
              </div>
            )}

            {/* Playback Preview Bar if sample is ready */}
            {audioUrl && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayPreview}
                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    )}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Voice Sample Captured
                    </span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Click play to listen to your custom sample
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioUrl(null)}
                  className="text-xs text-rose-500 hover:underline p-1 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Voice Name & Profile */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Voice Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rizwan Ahmad (Studio) or My Urdu Voice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Gender & Primary Language Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      gender === 'male'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      gender === 'female'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ur">Urdu (اردو)</option>
                  <option value="ur-roman">Roman Urdu</option>
                  <option value="en">English (US/UK)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ar">Arabic (العربية)</option>
                  <option value="pa">Punjabi (ਪੰਜਾਬੀ / پنجابی)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="tr">Turkish (Türkçe)</option>
                </select>
              </div>
            </div>

            {/* Accent & Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Accent / Dialect
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lahori Warm, Karachi Formal, Urban"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vocal Tone
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as VoiceStyle)}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="conversational">Conversational (Natural)</option>
                  <option value="narrator">Narrator / Audiobook</option>
                  <option value="news">News Anchor</option>
                  <option value="podcast">Podcast Host</option>
                  <option value="social_media">Reels / Shorts Creator</option>
                  <option value="storytelling">Storyteller / Poetic</option>
                </select>
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Choose Voice Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative shrink-0 w-11 h-11 rounded-2xl overflow-hidden border-2 transition-transform ${
                      selectedAvatar === url
                        ? 'border-purple-600 scale-105 shadow-md ring-2 ring-purple-500/30'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {selectedAvatar === url && (
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRecording}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveVoice}
            disabled={isRecording || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create & Activate Voice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
