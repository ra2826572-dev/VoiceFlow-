import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  Sparkles,
  Download,
  Languages,
  Mic,
  CheckCircle2,
  FileText,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  Check,
  Users,
  Layers,
  Type,
  Wand2,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { VOICES_CATALOG } from '../data/voices';
import {
  DubbingProject,
  DubbingSegment,
  DubbingSpeaker,
  DubbingProcessingStatus,
  AudioMixingConfig,
  LipSyncConfig,
  SubtitleStyle,
} from '../types';

const TARGET_LANGUAGES = [
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ur-roman', name: 'Roman Urdu', native: 'Roman Urdu' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ / پنجابی' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
];

export const VideoDubbingStudioView: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();

  // Active Dubbing Project State
  const [project, setProject] = useState<DubbingProject | null>(null);
  const [projectsList, setProjectsList] = useState<DubbingProject[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'speakers' | 'mixing' | 'subtitles' | 'export' | 'projects'>('timeline');

  // Video Player State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [audioSourceMode, setAudioSourceMode] = useState<'mixed' | 'original'>('mixed');
  const [videoVolume, setVideoVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Subtitle Overlay Mode
  const [subtitleMode, setSubtitleMode] = useState<'translated' | 'original' | 'dual' | 'off'>('translated');

  // Processing & Pipeline Loading State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStageMessage, setActiveStageMessage] = useState<string>('');
  const [activeSegmentPlayingId, setActiveSegmentPlayingId] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadTargetLang, setUploadTargetLang] = useState<string>('Urdu');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/dubbing/projects', {
        headers: { 'x-user-id': user?.id || 'user-1' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjectsList(data.projects);
        if (!project && data.projects.length > 0) {
          setProject(data.projects[0]);
          setDuration(data.projects[0].videoDuration || 12);
        } else if (!project) {
          // Initialize with default demo project
          initPresetProject('tech-demo');
        }
      } else if (!project) {
        initPresetProject('tech-demo');
      }
    } catch (e) {
      console.warn('Error fetching dubbing projects:', e);
      if (!project) initPresetProject('tech-demo');
    }
  };

  const initPresetProject = async (presetId: 'tech-demo' | 'product-review') => {
    setIsProcessing(true);
    setActiveStageMessage('Initializing AI dubbing project...');
    try {
      const res = await fetch('/api/dubbing/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({
          presetId,
          targetLanguage: 'Urdu',
        }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        setDuration(data.project.videoDuration || 12);
        // Automatically run transcription to populate timeline
        await runTranscription(data.project.id);
      }
    } catch (err: any) {
      toastError('Failed to initialize project: ' + err.message);
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // Video Time Update & Subtitle Tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
        if (project && (!project.videoDuration || project.videoDuration === 12)) {
          setProject({ ...project, videoDuration: Math.round(dur * 10) / 10 });
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }
  };

  const seekVideo = (timeSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(timeSeconds, duration));
      setCurrentTime(timeSeconds);
    }
  };

  // Find active segment at current playback time
  const activeSegment = project?.segments.find(
    (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime
  );

  // 1. Video Upload Handler
  const handleUploadVideo = async () => {
    if (!selectedFile) {
      toastError('Please choose a video file first');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(20);
    setActiveStageMessage('Uploading video & extracting acoustic speech...');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('targetLanguage', uploadTargetLang);

      const res = await fetch('/api/dubbing/upload', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || 'user-1',
        },
        body: formData,
      });

      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      setProject(data.project);
      setDuration(data.duration || 12);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      success('Video uploaded successfully!');

      // Automatically trigger transcription for uploaded video
      await runTranscription(data.project.id);
    } catch (err: any) {
      toastError(err.message || 'Failed to upload video');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setActiveStageMessage('');
    }
  };

  // 2. Transcription Handler
  const runTranscription = async (projectId?: string) => {
    const pId = projectId || project?.id;
    if (!pId) return;

    setIsProcessing(true);
    setActiveStageMessage('AI STT: Transcribing speech & performing speaker diarization...');

    try {
      const res = await fetch('/api/dubbing/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({ projectId: pId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      setProject(data.project);
      success(`Transcription complete! Detected ${data.detectedLanguage} (${data.segments.length} segments).`);
    } catch (err: any) {
      toastError(err.message || 'Transcription failed');
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // 3. Translation Handler
  const runTranslation = async (targetLang?: string) => {
    if (!project?.id) return;
    const tgt = targetLang || project.targetLanguage || 'Urdu';

    setIsProcessing(true);
    setActiveStageMessage(`Translating speech segments to ${tgt} preserving context...`);

    try {
      const res = await fetch('/api/dubbing/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({
          projectId: project.id,
          targetLanguage: tgt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      setProject(data.project);
      success(`Successfully translated all segments into ${tgt}!`);
    } catch (err: any) {
      toastError(err.message || 'Translation failed');
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // 4. Synthesize Single Segment
  const handleSynthesizeSegment = async (seg: DubbingSegment) => {
    if (!project?.id) return;

    setActiveSegmentPlayingId(seg.id);
    setActiveStageMessage(`Synthesizing voice for segment ${seg.id}...`);

    try {
      const res = await fetch('/api/dubbing/synthesize-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({
          projectId: project.id,
          segmentId: seg.id,
          text: seg.translatedText || seg.originalText,
          voiceId: seg.voiceId,
          speed: seg.speed,
          pitch: seg.pitch,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Segment synthesis failed');
      }

      // Update segment in local state
      const updatedSegments = project.segments.map((s) =>
        s.id === seg.id ? { ...s, audioUrl: data.audioUrl, status: 'ready' as const } : s
      );
      setProject({ ...project, segments: updatedSegments });

      // Play audio preview
      if (data.audioUrl) {
        if (audioPreviewRef.current) {
          audioPreviewRef.current.src = data.audioUrl;
          audioPreviewRef.current.play().catch(console.warn);
        }
      }
      success(`Segment ${seg.id} synthesized successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Failed to synthesize segment speech');
    } finally {
      setActiveSegmentPlayingId(null);
      setActiveStageMessage('');
    }
  };

  // 5. Generate All Voice Dubbing
  const runGenerateAllVoices = async () => {
    if (!project?.id) return;

    setIsProcessing(true);
    setActiveStageMessage('Synthesizing neural voices & assembling multi-speaker dubbed track...');

    try {
      const res = await fetch('/api/dubbing/generate-all-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({ projectId: project.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Voice generation failed');
      }

      setProject(data.project);
      success('AI Dubbed speech tracks successfully synthesized and aligned!');
    } catch (err: any) {
      toastError(err.message || 'Failed to generate voices');
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // 6. Audio Mixing & Final Video Render
  const runMixAndRender = async () => {
    if (!project?.id) return;

    setIsProcessing(true);
    setActiveStageMessage('Mixing audio tracks, aligning lip-sync & rendering final video...');

    try {
      const res = await fetch('/api/dubbing/mix-and-render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-1',
        },
        body: JSON.stringify({
          projectId: project.id,
          audioMixing: project.audioMixing,
          lipSync: project.lipSync,
          subtitleStyle: project.subtitleStyle,
          burnSubtitles: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Rendering failed');
      }

      setProject(data.project);
      setAudioSourceMode('mixed');
      success('AI Dubbing complete! Final video and audio tracks are ready.');
    } catch (err: any) {
      toastError(err.message || 'Failed to mix and render video');
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // Full End-to-End Dubbing Pipeline
  const runFullPipeline = async () => {
    if (!project?.id) return;
    setIsProcessing(true);

    try {
      // Step 1: Transcribe if no segments
      if (!project.segments || project.segments.length === 0) {
        setActiveStageMessage('Step 1/4: Transcribing speech & diarizing speakers...');
        const resTrans = await fetch('/api/dubbing/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || 'user-1' },
          body: JSON.stringify({ projectId: project.id }),
        });
        const transData = await resTrans.json();
        if (transData.project) setProject(transData.project);
      }

      // Step 2: Translate
      setActiveStageMessage(`Step 2/4: Translating dialogue into ${project.targetLanguage}...`);
      const resTranslat = await fetch('/api/dubbing/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || 'user-1' },
        body: JSON.stringify({ projectId: project.id, targetLanguage: project.targetLanguage }),
      });
      const translatData = await resTranslat.json();
      if (translatData.project) setProject(translatData.project);

      // Step 3: Synthesize Voices
      setActiveStageMessage('Step 3/4: Generating neural AI speech tracks...');
      const resVoices = await fetch('/api/dubbing/generate-all-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || 'user-1' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const voicesData = await resVoices.json();
      if (voicesData.project) setProject(voicesData.project);

      // Step 4: Mix & Render
      setActiveStageMessage('Step 4/4: Mixing background acoustics & rendering dubbed video...');
      const resRender = await fetch('/api/dubbing/mix-and-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || 'user-1' },
        body: JSON.stringify({
          projectId: project.id,
          audioMixing: project.audioMixing,
          lipSync: project.lipSync,
          subtitleStyle: project.subtitleStyle,
        }),
      });
      const renderData = await resRender.json();
      if (renderData.project) setProject(renderData.project);

      setAudioSourceMode('mixed');
      success('🎉 Entire AI Dubbing Pipeline completed end-to-end!');
    } catch (err: any) {
      toastError('Pipeline error: ' + err.message);
    } finally {
      setIsProcessing(false);
      setActiveStageMessage('');
    }
  };

  // Export Artifacts
  const handleExport = (format: 'mp4' | 'mp3' | 'wav' | 'srt' | 'vtt') => {
    if (!project?.id) return;
    const downloadUrl = `/api/dubbing/export/${project.id}/${format}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${project.name || 'dubbed'}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success(`Downloading .${format.toUpperCase()} export!`);
  };

  // Segment modifications
  const handleUpdateSegment = (id: string, updates: Partial<DubbingSegment>) => {
    if (!project) return;
    const updated = project.segments.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setProject({ ...project, segments: updated });
  };

  const handleDeleteSegment = (id: string) => {
    if (!project) return;
    const updated = project.segments.filter((s) => s.id !== id);
    setProject({ ...project, segments: updated });
    success('Segment deleted');
  };

  const handleAddSegment = () => {
    if (!project) return;
    const lastSeg = project.segments[project.segments.length - 1];
    const newStart = lastSeg ? Math.min(lastSeg.endTime + 0.2, project.videoDuration) : 0;
    const newEnd = Math.min(newStart + 3.0, project.videoDuration);

    const newSeg: DubbingSegment = {
      id: `seg-${Date.now().toString(36)}`,
      startTime: Math.round(newStart * 10) / 10,
      endTime: Math.round(newEnd * 10) / 10,
      speakerId: project.speakers[0]?.id || 'speaker-1',
      speakerName: project.speakers[0]?.name || 'Speaker 1',
      originalText: 'New spoken phrase...',
      translatedText: 'نیا جملہ...',
      voiceId: project.speakers[0]?.assignedVoiceId || 'voice-ur-zara',
      speed: 1.0,
      pitch: 'normal',
      volume: 100,
      status: 'pending',
    };

    setProject({ ...project, segments: [...project.segments, newSeg] });
    success('New segment added to timeline');
  };

  // Determine active video source URL
  const videoSrc = project?.renderedVideoUrl && audioSourceMode === 'mixed'
    ? project.renderedVideoUrl
    : project?.originalVideoUrl || '/sample-videos/tech-keynote.mp4';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hidden audio element for previewing single segment speech */}
      <audio ref={audioPreviewRef} className="hidden" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Video Dubbing Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase tracking-wide border border-emerald-500/30">
              Production Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real end-to-end multimodal dubbing: audio extraction, STT diarization, contextual translation, neural multi-speaker synthesis, and ffmpeg audio mixing.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            Upload Video
          </button>

          <button
            onClick={runFullPipeline}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Run Full AI Dubbing
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700">
              <Download className="w-4 h-4 text-blue-400" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
              <button
                onClick={() => handleExport('mp4')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Export Dubbed MP4</span>
                <span className="text-[10px] text-purple-400 font-mono">.mp4</span>
              </button>
              <button
                onClick={() => handleExport('mp3')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Export Dubbed Audio</span>
                <span className="text-[10px] text-blue-400 font-mono">.mp3</span>
              </button>
              <button
                onClick={() => handleExport('srt')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Download Subtitles</span>
                <span className="text-[10px] text-emerald-400 font-mono">.srt</span>
              </button>
              <button
                onClick={() => handleExport('vtt')}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Download WebVTT</span>
                <span className="text-[10px] text-amber-400 font-mono">.vtt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Processing Banner */}
      {isProcessing && (
        <div className="p-3.5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-xl flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-purple-200">{activeStageMessage || 'Processing dubbing task...'}</span>
              <span className="text-purple-300 font-mono">{project?.progress?.percent || 50}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(15, project?.progress?.percent || 50)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Video Player & Subtitles, Right Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Preview & Subtitles Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Video Player Box with Live Subtitle Overlay */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                playsInline
              />

              {/* Live Subtitle Overlay burned onto player canvas */}
              {subtitleMode !== 'off' && activeSegment && (
                <div
                  className={`absolute left-0 right-0 px-6 flex justify-center pointer-events-none transition-all duration-150 z-20 ${
                    project?.subtitleStyle?.position === 'top'
                      ? 'top-4'
                      : project?.subtitleStyle?.position === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-12'
                  }`}
                >
                  <div
                    style={{
                      fontFamily: project?.subtitleStyle?.fontFamily || 'Inter',
                      fontSize: `${project?.subtitleStyle?.fontSize || 16}px`,
                      color: project?.subtitleStyle?.color || '#FFFFFF',
                      backgroundColor:
                        project?.subtitleStyle?.backgroundColor && project?.subtitleStyle?.backgroundOpacity
                          ? `rgba(0,0,0,${project.subtitleStyle.backgroundOpacity / 100})`
                          : 'rgba(0,0,0,0.75)',
                      textShadow: project?.subtitleStyle?.textShadow
                        ? '0px 2px 4px rgba(0,0,0,0.9)'
                        : 'none',
                      fontWeight: project?.subtitleStyle?.bold ? 700 : 500,
                    }}
                    className="px-4 py-1.5 rounded-lg max-w-[90%] text-center leading-relaxed backdrop-blur-[2px] transition-all"
                  >
                    {subtitleMode === 'translated' && (
                      <p dir="auto">{activeSegment.translatedText || activeSegment.originalText}</p>
                    )}
                    {subtitleMode === 'original' && (
                      <p>{activeSegment.originalText}</p>
                    )}
                    {subtitleMode === 'dual' && (
                      <div className="space-y-0.5">
                        <p dir="auto" className="text-yellow-300 font-semibold">
                          {activeSegment.translatedText}
                        </p>
                        <p className="text-[12px] opacity-80">{activeSegment.originalText}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Play Overlay Button on Hover */}
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </div>
              </button>
            </div>

            {/* Video Player Scrubber & Controls */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
              {/* Scrub Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 w-10 text-right">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 12}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seekVideo(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] font-mono text-slate-400 w-10">
                  {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                </span>
              </div>

              {/* Audio Controls Bar */}
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          const nextMuted = !isMuted;
                          videoRef.current.muted = nextMuted;
                          setIsMuted(nextMuted);
                        }
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : videoVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVideoVolume(val);
                        if (videoRef.current) {
                          videoRef.current.volume = val;
                          videoRef.current.muted = false;
                          setIsMuted(false);
                        }
                      }}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Audio Track Selector: Dubbed Mix vs Original */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setAudioSourceMode('mixed')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      audioSourceMode === 'mixed'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dubbed Voice & Mix
                  </button>
                  <button
                    onClick={() => setAudioSourceMode('original')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      audioSourceMode === 'original'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Audio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info & Action Chips */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {Math.round(duration)}s Duration
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                Original: <strong className="text-white">{project?.originalLanguage || 'English'}</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Speakers: <strong className="text-white">{project?.speakers?.length || 2}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Target:</span>
              <select
                value={project?.targetLanguage || 'Urdu'}
                onChange={(e) => {
                  const newLang = e.target.value;
                  if (project) {
                    setProject({ ...project, targetLanguage: newLang });
                    runTranslation(newLang);
                  }
                }}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:ring-purple-500"
              >
                {TARGET_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Studio Tools, Timeline & Controls Tabs */}
        <div className="lg:col-span-6 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Timeline ({project?.segments?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('speakers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'speakers'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Speakers ({project?.speakers?.length || 2})
            </button>

            <button
              onClick={() => setActiveTab('mixing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'mixing'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Mixing & Lip-Sync
            </button>

            <button
              onClick={() => setActiveTab('subtitles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'subtitles'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Subtitles Style
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Projects
            </button>
          </div>

          {/* TAB 1: TIMELINE & EDITABLE SEGMENTS */}
          {activeTab === 'timeline' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Dubbing Timeline Segments</h3>
                  <p className="text-[11px] text-slate-400">
                    Click any segment to seek video. Edit transcript or translation directly.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSegment}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    Add Segment
                  </button>
                  <button
                    onClick={() => runGenerateAllVoices()}
                    disabled={isProcessing}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Synthesize All
                  </button>
                </div>
              </div>

              {/* Segments List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {project?.segments && project.segments.length > 0 ? (
                  project.segments.map((seg, idx) => {
                    const isCurrent = currentTime >= seg.startTime && currentTime <= seg.endTime;
                    const speakerObj = project.speakers.find((s) => s.id === seg.speakerId);

                    return (
                      <div
                        key={seg.id}
                        onClick={() => seekVideo(seg.startTime)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                            : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        {/* Segment Header */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{
                                backgroundColor: (speakerObj?.color || '#8B5CF6') + '22',
                                color: speakerObj?.color || '#8B5CF6',
                                border: `1px solid ${speakerObj?.color || '#8B5CF6'}44`,
                              }}
                            >
                              {speakerObj?.name || seg.speakerName || 'Speaker 1'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {seg.startTime.toFixed(1)}s - {seg.endTime.toFixed(1)}s
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSynthesizeSegment(seg)}
                              disabled={activeSegmentPlayingId === seg.id}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] flex items-center gap-1 px-2"
                              title="Synthesize and audition speech for this segment"
                            >
                              {activeSegmentPlayingId === seg.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
                              ) : (
                                <Volume2 className="w-3 h-3 text-emerald-400" />
                              )}
                              Listen
                            </button>

                            <button
                              onClick={() => handleDeleteSegment(seg.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              title="Delete segment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Text Inputs: Original & Translated */}
                        <div className="space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">
                              Original Speech ({project.originalLanguage || 'English'}):
                            </label>
                            <input
                              type="text"
                              value={seg.originalText}
                              onChange={(e) => handleUpdateSegment(seg.id, { originalText: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-purple-300 block mb-0.5">
                              Dubbed Translation ({project.targetLanguage || 'Urdu'}):
                            </label>
                            <input
                              type="text"
                              dir="auto"
                              value={seg.translatedText}
                              onChange={(e) => handleUpdateSegment(seg.id, { translatedText: e.target.value })}
                              className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No segments detected yet. Click "Run Full AI Dubbing" or "Upload Video".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPEAKER CASTING (DIARIZATION) */}
          {activeTab === 'speakers' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Speaker Diarization & Voice Casting</h3>
                <p className="text-[11px] text-slate-400">
                  Assign individual AI vocal personas to detected speakers in the video.
                </p>
              </div>

              <div className="space-y-3">
                {project?.speakers.map((spk, i) => (
                  <div key={spk.id} className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: spk.color || '#8B5CF6' }}
                        />
                        <input
                          type="text"
                          value={spk.name}
                          onChange={(e) => {
                            if (!project) return;
                            const updated = project.speakers.map((s) =>
                              s.id === spk.id ? { ...s, name: e.target.value } : s
                            );
                            setProject({ ...project, speakers: updated });
                          }}
                          className="bg-transparent border-b border-slate-600 text-white font-semibold text-xs px-1 py-0.5 focus:border-purple-400"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 uppercase font-mono">
                        {spk.gender} voice
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Assigned AI Dubbing Voice:
                      </label>
                      <select
                        value={spk.assignedVoiceId}
                        onChange={(e) => {
                          if (!project) return;
                          const selectedVoice = VOICES_CATALOG.find((v) => v.id === e.target.value);
                          const updated = project.speakers.map((s) =>
                            s.id === spk.id
                              ? {
                                  ...s,
                                  assignedVoiceId: e.target.value,
                                  assignedVoiceName: selectedVoice?.name || e.target.value,
                                }
                              : s
                          );
                          setProject({ ...project, speakers: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 focus:ring-purple-500"
                      >
                        {VOICES_CATALOG.slice(0, 30).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.language.toUpperCase()} • {v.gender} • {v.style})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO MIXING & LIP-SYNC */}
          {activeTab === 'mixing' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Audio Mixing & AI Lip-Sync</h3>
                <p className="text-[11px] text-slate-400">
                  Control volume balance, background audio ducking, and facial phoneme synchronization.
                </p>
              </div>

              {/* Mixing Sliders */}
              <div className="space-y-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Dubbed Voice Track Volume</span>
                    <span className="text-purple-400 font-mono">
                      {project?.audioMixing?.dubbedVoiceVolume ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={project?.audioMixing?.dubbedVoiceVolume ?? 100}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        audioMixing: {
                          ...project.audioMixing,
                          dubbedVoiceVolume: parseInt(e.target.value),
                        },
                      });
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Original Video Background Sound</span>
                    <span className="text-blue-400 font-mono">
                      {project?.audioMixing?.originalAudioVolume ?? 15}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={project?.audioMixing?.originalAudioVolume ?? 15}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        audioMixing: {
                          ...project.audioMixing,
                          originalAudioVolume: parseInt(e.target.value),
                        },
                      });
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold text-white block">Auto-Ducking</span>
                    <span className="text-[10px] text-slate-400">
                      Lowers original audio automatically whenever the dubbed speaker talks.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={project?.audioMixing?.autoDucking ?? true}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        audioMixing: {
                          ...project.audioMixing,
                          autoDucking: e.target.checked,
                        },
                      });
                    }}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold text-white block">Acoustic Noise Reduction</span>
                    <span className="text-[10px] text-slate-400">
                      Suppresses background room noise and tape hiss from original video audio.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={project?.audioMixing?.noiseReduction ?? true}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        audioMixing: {
                          ...project.audioMixing,
                          noiseReduction: e.target.checked,
                        },
                      });
                    }}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Lip-Sync Section */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">AI Visual Lip-Sync (Phoneme Alignment)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={project?.lipSync?.enabled ?? true}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        lipSync: { ...project.lipSync, enabled: e.target.checked },
                      });
                    }}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Aligns vocal timings with speaker mouth movement using neural facial acoustic mapping.
                </p>
              </div>

              <button
                onClick={runMixAndRender}
                disabled={isProcessing}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Apply Mixing & Render Dubbed Audio/Video
              </button>
            </div>
          )}

          {/* TAB 4: SUBTITLES & STYLING */}
          {activeTab === 'subtitles' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Subtitles Styling & Export</h3>
                <p className="text-[11px] text-slate-400">
                  Customize subtitle overlay appearance and download `.srt` or `.vtt` caption tracks.
                </p>
              </div>

              {/* Display Mode */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Subtitle Display Mode:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['translated', 'original', 'dual', 'off'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSubtitleMode(mode)}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                        subtitleMode === mode
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font & Color Customization */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font Family:</label>
                  <select
                    value={project?.subtitleStyle?.fontFamily || 'Inter'}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        subtitleStyle: { ...project.subtitleStyle, fontFamily: e.target.value },
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5"
                  >
                    <option value="Inter">Inter (Clean Sans)</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia (Serif)</option>
                    <option value="Courier New">Courier (Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Position on Video:</label>
                  <select
                    value={project?.subtitleStyle?.position || 'bottom'}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        subtitleStyle: {
                          ...project.subtitleStyle,
                          position: e.target.value as any,
                        },
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5"
                  >
                    <option value="bottom">Bottom</option>
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Font Size</span>
                    <span>{project?.subtitleStyle?.fontSize || 16}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={26}
                    value={project?.subtitleStyle?.fontSize || 16}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        subtitleStyle: {
                          ...project.subtitleStyle,
                          fontSize: parseInt(e.target.value),
                        },
                      });
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Background Opacity</span>
                    <span>{project?.subtitleStyle?.backgroundOpacity || 80}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={project?.subtitleStyle?.backgroundOpacity || 80}
                    onChange={(e) => {
                      if (!project) return;
                      setProject({
                        ...project,
                        subtitleStyle: {
                          ...project.subtitleStyle,
                          backgroundOpacity: parseInt(e.target.value),
                        },
                      });
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleExport('srt')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download Subtitles (.SRT)
                </button>
                <button
                  onClick={() => handleExport('vtt')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Download WebVTT (.VTT)
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS LIST */}
          {activeTab === 'projects' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Dubbing Projects Library</h3>
                  <p className="text-[11px] text-slate-400">
                    Saved video dubbing workflows and export histories.
                  </p>
                </div>
                <button
                  onClick={() => initPresetProject('product-review')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
                >
                  Load Product Demo
                </button>
              </div>

              <div className="space-y-2.5">
                {projectsList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setProject(p);
                      setDuration(p.videoDuration || 12);
                      success(`Loaded project "${p.name}"`);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      project?.id === p.id
                        ? 'bg-purple-950/40 border-purple-500'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Target: <strong className="text-purple-300">{p.targetLanguage}</strong> • {p.segments?.length || 0} segments • {p.videoDuration}s
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                      {p.processingStatus || 'ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD VIDEO MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
                  <Upload className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">Upload Video for AI Dubbing</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name)) {
                    setSelectedFile(file);
                  } else {
                    toastError('Please choose a valid video file (MP4, MOV, WebM, etc.)');
                  }
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-950/20'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/avi"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Film className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                  <p className="text-[10px] text-purple-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">
                    Click to browse or drag & drop video here
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports MP4, MOV, WebM, AVI, MKV (Up to 150MB)
                  </p>
                </div>
              )}
            </div>

            {/* Target Language Selection */}
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                Target Dubbing Language:
              </label>
              <select
                value={uploadTargetLang}
                onChange={(e) => setUploadTargetLang(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-purple-500"
              >
                {TARGET_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Or pick a sample preset */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-2 font-semibold">
                Or instantly try sample demo videos:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    initPresetProject('tech-demo');
                    setIsUploadModalOpen(false);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-xs border border-slate-700 transition-colors"
                >
                  <strong className="block text-white">Tech Keynote</strong>
                  <span className="text-[10px] text-slate-400">12s Presentation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    initPresetProject('product-review');
                    setIsUploadModalOpen(false);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-xs border border-slate-700 transition-colors"
                >
                  <strong className="block text-white">Product Review</strong>
                  <span className="text-[10px] text-slate-400">15s Hardware Review</span>
                </button>
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadVideo}
                disabled={!selectedFile || isProcessing}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                {isProcessing ? 'Uploading...' : 'Start AI Dubbing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
