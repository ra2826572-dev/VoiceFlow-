import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Upload,
  FileAudio,
  AlertCircle,
} from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useToast } from '../context/ToastContext';

interface RecordingButtonProps {
  onRecordingComplete: (audioBlob: Blob, audioBase64: string, duration: number, liveText?: string) => void;
  onLiveTranscript?: (text: string) => void;
  language?: string;
  className?: string;
  id?: string;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  onRecordingComplete,
  onLiveTranscript,
  language = 'ur',
  className = '',
  id = 'voice-recorder',
}) => {
  const { error, info } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  // Timer while recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      liveTranscriptRef.current = '';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Start live speech recognition if supported for ultra-fast instant reply
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        try {
          const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'ur' ? 'ur-PK' : language === 'ar' ? 'ar-SA' : language === 'hi' ? 'hi-IN' : 'en-US';
          
          recognition.onresult = (event: any) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript;
            }
            if (combined.trim()) {
              liveTranscriptRef.current = combined.trim();
              onLiveTranscript?.(combined.trim());
            }
          };
          recognition.onerror = () => {};
          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          // Non-blocking fallback
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        setRecordedBlob(audioBlob);

        // Convert blob to base64 for API
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1] || '';
          onRecordingComplete(audioBlob, base64Data, recordingTime || 3, liveTranscriptRef.current);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setRecordedAudioUrl(null);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      error('Microphone permission is required to record audio.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      error('Please select an audio file (MP3, WAV, WebM, M4A)');
      return;
    }

    const audioUrl = URL.createObjectURL(file);
    setRecordedAudioUrl(audioUrl);
    setRecordedBlob(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1] || '';
      onRecordingComplete(file, base64Data, 5);
      info(`Loaded "${file.name}" for transcription`);
    };
    reader.readAsDataURL(file);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id={id} className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 ${className}`}>
      {/* File Upload Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-center space-y-2">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Record Audio or Upload Audio File
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Capture speech with your microphone or upload any WAV, MP3, or WebM audio file to transcribe with high AI precision.
        </p>
      </div>

      {/* Visualizer Waveform */}
      <div className="h-20 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center overflow-hidden">
        <WaveformVisualizer isRecording={isRecording && !isPaused} barCount={48} height={60} />
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white tracking-widest">
          {formatSeconds(recordingTime)}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {isRecording ? (isPaused ? 'Recording Paused' : 'Listening...') : recordedAudioUrl ? 'Audio Ready' : 'Ready to Record'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <>
            <button
              id="btn-start-record"
              onClick={startRecording}
              className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-5 h-5 fill-white" />
              <span>Start Recording</span>
            </button>

            <button
              id="btn-upload-audio-file"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-500" />
              <span>Upload Audio</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="btn-pause-record"
              onClick={pauseRecording}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-5 h-5 text-emerald-500" /> : <Pause className="w-5 h-5 text-amber-500" />}
            </button>

            <button
              id="btn-stop-record"
              onClick={stopRecording}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/40 hover:bg-rose-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Transcribe</span>
            </button>
          </>
        )}

        {recordedAudioUrl && !isRecording && (
          <button
            id="btn-reset-record"
            onClick={resetRecording}
            className="p-3 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear and record again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Audio Playback Preview if recorded */}
      {recordedAudioUrl && !isRecording && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Recorded Speech Preview
            </span>
          </div>
          <audio src={recordedAudioUrl} controls className="h-8 max-w-xs" />
        </div>
      )}
    </div>
  );
};
