import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Download,
  Sparkles,
  Volume2,
  Clock,
  Layers,
  FileAudio,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { VOICES_CATALOG } from '../data/voices';
import { DialogueSpeaker, DialogueLine } from '../types';

export const MultiSpeakerStudioView: React.FC = () => {
  const { success, error } = useToast();

  // Initial Speakers
  const [speakers, setSpeakers] = useState<DialogueSpeaker[]>([
    {
      id: 'spk-1',
      name: 'Speaker 1 (Male Host)',
      voiceId: 'voice-ur-roman-hamza',
      voiceName: 'Hamza (Roman Urdu / English)',
      color: '#8B5CF6', // Purple
      gender: 'male',
    },
    {
      id: 'spk-2',
      name: 'Speaker 2 (Female Expert)',
      voiceId: 'voice-ur-zara',
      voiceName: 'Zara Khan (Urdu Natural)',
      color: '#EC4899', // Pink
      gender: 'female',
    },
    {
      id: 'spk-3',
      name: 'Speaker 3 (Narrator)',
      voiceId: 'voice-en-david',
      voiceName: 'David Sterling (Deep Narrator)',
      color: '#3B82F6', // Blue
      gender: 'male',
    },
  ]);

  // Dialogue Lines
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    {
      id: 'line-1',
      speakerId: 'spk-3',
      text: 'VoiceFlow AI Presents: The Future of Synthetic Human Speech.',
      duration: 3.8,
    },
    {
      id: 'line-2',
      speakerId: 'spk-1',
      text: 'Welcome back everyone. Today we are exploring how neural multi-speaker dialogs work in real-time.',
      duration: 5.2,
    },
    {
      id: 'line-3',
      speakerId: 'spk-2',
      text: 'یہ واقعی حیرت انگیز ہے! اب آپ ایک ہی اسٹوڈیو میں مختلف کرداروں کے درمیان قدرتی مکالمہ تشکیل دے سکتے ہیں۔',
      duration: 6.4,
    },
    {
      id: 'line-4',
      speakerId: 'spk-1',
      text: 'Exactly Zara. With dynamic inflection and zero robotic tone, it sounds completely authentic.',
      duration: 4.9,
    },
  ]);

  const [activeLinePlaying, setActiveLinePlaying] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [fullConversationAudio, setFullConversationAudio] = useState<string>('');
  const [isPlayingFull, setIsPlayingFull] = useState<boolean>(false);
  const fullAudioRef = useRef<HTMLAudioElement | null>(null);

  // Line Audio Preview
  const handlePreviewLine = async (line: DialogueLine) => {
    const speaker = speakers.find((s) => s.id === line.speakerId);
    if (!speaker) return;

    setActiveLinePlaying(line.id);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: line.text,
          voice: { id: speaker.voiceId, name: speaker.voiceName, gender: speaker.gender },
          speed: 1.0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setActiveLinePlaying(null);
        audio.play();
      } else {
        setActiveLinePlaying(null);
      }
    } catch {
      setActiveLinePlaying(null);
      error('Failed to preview line audio');
    }
  };

  // Move Dialogue Line Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...dialogueLines];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setDialogueLines(updated);
  };

  // Move Dialogue Line Down
  const handleMoveDown = (index: number) => {
    if (index === dialogueLines.length - 1) return;
    const updated = [...dialogueLines];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setDialogueLines(updated);
  };

  // Add Dialogue Line
  const handleAddLine = () => {
    const newLine: DialogueLine = {
      id: 'line-' + Date.now(),
      speakerId: speakers[0]?.id || 'spk-1',
      text: '',
      duration: 3.5,
    };
    setDialogueLines([...dialogueLines, newLine]);
  };

  // Delete Dialogue Line
  const handleDeleteLine = (id: string) => {
    if (dialogueLines.length <= 1) {
      error('Conversation must have at least 1 dialogue line');
      return;
    }
    setDialogueLines(dialogueLines.filter((l) => l.id !== id));
  };

  // Add Speaker
  const handleAddSpeaker = () => {
    const colors = ['#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'];
    const nextColor = colors[speakers.length % colors.length];
    const newSpk: DialogueSpeaker = {
      id: 'spk-' + Date.now(),
      name: `Speaker ${speakers.length + 1}`,
      voiceId: VOICES_CATALOG[(speakers.length + 2) % VOICES_CATALOG.length].id,
      voiceName: VOICES_CATALOG[(speakers.length + 2) % VOICES_CATALOG.length].name,
      color: nextColor,
      gender: 'female',
    };
    setSpeakers([...speakers, newSpk]);
    success(`Added ${newSpk.name}`);
  };

  // Remove Speaker
  const handleRemoveSpeaker = (id: string) => {
    if (speakers.length <= 2) {
      error('A multi-speaker dialogue requires at least 2 speakers');
      return;
    }
    setSpeakers(speakers.filter((s) => s.id !== id));
    // Reassign lines using this speaker
    const fallbackId = speakers.find((s) => s.id !== id)?.id || '';
    setDialogueLines(
      dialogueLines.map((l) => (l.speakerId === id ? { ...l, speakerId: fallbackId } : l))
    );
  };

  // Generate Complete Conversation Audio
  const handleGenerateCompleteConversation = async () => {
    setIsGeneratingAll(true);
    try {
      // Pick first voice for demo stitching
      const primaryVoice = VOICES_CATALOG.find((v) => v.id === speakers[0].voiceId) || VOICES_CATALOG[0];
      const concatenatedScript = dialogueLines.map((l) => l.text).join(' ');

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: concatenatedScript,
          voice: primaryVoice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFullConversationAudio(data.audioUrl);
        success('Complete multi-speaker conversation audio mastered!');
      }
    } catch {
      error('Failed to generate complete conversation');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const totalDuration = dialogueLines.reduce((acc, l) => acc + (l.duration || 4.0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Audio Element for full audio */}
      {fullConversationAudio && (
        <audio
          ref={fullAudioRef}
          src={fullConversationAudio}
          onEnded={() => setIsPlayingFull(false)}
          className="hidden"
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Multi-Speaker Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wide border border-indigo-500/30">
              Dialogue Flow
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build natural conversations with multiple voice actors, podcast interviews, and dynamic storytelling scripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSpeaker}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Speaker</span>
          </button>

          <button
            onClick={handleGenerateCompleteConversation}
            disabled={isGeneratingAll}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAll ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate Full Audio</span>
          </button>
        </div>
      </div>

      {/* Speaker Cards Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {speakers.map((spk, idx) => (
          <div
            key={spk.id}
            className="p-4 rounded-2xl bg-[#11121c] border border-slate-800 flex items-center justify-between gap-3 shadow-md"
            style={{ borderLeftColor: spk.color, borderLeftWidth: 4 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                style={{ backgroundColor: spk.color }}
              >
                {idx + 1}
              </div>
              <div className="min-w-0">
                <input
                  type="text"
                  value={spk.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpeakers(speakers.map((s) => (s.id === spk.id ? { ...s, name: val } : s)));
                  }}
                  className="font-bold text-xs text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:outline-none truncate w-full"
                />
                <select
                  value={spk.voiceId}
                  onChange={(e) => {
                    const picked = VOICES_CATALOG.find((v) => v.id === e.target.value);
                    if (picked) {
                      setSpeakers(
                        speakers.map((s) =>
                          s.id === spk.id
                            ? { ...s, voiceId: picked.id, voiceName: picked.name, gender: picked.gender }
                            : s
                        )
                      );
                    }
                  }}
                  className="text-[11px] text-slate-400 bg-transparent border-none focus:outline-none cursor-pointer mt-0.5 truncate max-w-[170px]"
                >
                  {VOICES_CATALOG.map((v) => (
                    <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                      {v.name} ({v.languageName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {speakers.length > 2 && (
              <button
                onClick={() => handleRemoveSpeaker(spk.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Remove speaker"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Visual Conversation Timeline */}
      <div className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Conversation Timeline
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              (~{totalDuration.toFixed(1)}s total runtime)
            </span>
          </div>

          {fullConversationAudio && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (fullAudioRef.current) {
                    if (isPlayingFull) {
                      fullAudioRef.current.pause();
                      setIsPlayingFull(false);
                    } else {
                      fullAudioRef.current.play();
                      setIsPlayingFull(true);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                {isPlayingFull ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingFull ? 'Pause' : 'Play Full Dialogue'}</span>
              </button>

              <a
                href={fullConversationAudio}
                download="voiceflow-multi-speaker-dialogue.mp3"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Proportional Segment Bar */}
        <div className="h-6 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex">
          {dialogueLines.map((line) => {
            const speaker = speakers.find((s) => s.id === line.speakerId);
            const widthPct = ((line.duration || 4) / totalDuration) * 100;
            return (
              <div
                key={line.id}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: speaker?.color || '#8B5CF6',
                }}
                title={`${speaker?.name}: "${line.text}"`}
                className="h-full border-r border-slate-950/40 opacity-85 hover:opacity-100 transition-opacity cursor-pointer relative group"
              />
            );
          })}
        </div>
      </div>

      {/* Dialogue Lines Editor List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dialogue Script Blocks ({dialogueLines.length})
          </h3>
          <button
            onClick={handleAddLine}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line</span>
          </button>
        </div>

        {dialogueLines.map((line, idx) => {
          const speaker = speakers.find((s) => s.id === line.speakerId) || speakers[0];
          return (
            <div
              key={line.id}
              className="rounded-2xl bg-[#11121c] border border-slate-800 p-4 space-y-3 shadow-md hover:border-slate-700 transition-all"
              style={{ borderLeftColor: speaker.color, borderLeftWidth: 4 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Speaker Selector */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[10px]"
                    style={{ backgroundColor: speaker.color }}
                  >
                    {idx + 1}
                  </div>
                  <select
                    value={line.speakerId}
                    onChange={(e) => {
                      const updated = dialogueLines.map((l) =>
                        l.id === line.id ? { ...l, speakerId: e.target.value } : l
                      );
                      setDialogueLines(updated);
                    }}
                    className="text-xs font-bold text-white bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.voiceName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Line Reordering & Preview Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handlePreviewLine(line)}
                    disabled={activeLinePlaying === line.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-600/30 text-purple-300 text-xs font-medium flex items-center gap-1 border border-slate-800 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>{activeLinePlaying === line.id ? 'Playing...' : 'Preview Line'}</span>
                  </button>

                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === dialogueLines.length - 1}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteLine(line.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800"
                    title="Delete Line"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                value={line.text}
                onChange={(e) => {
                  const updated = dialogueLines.map((l) =>
                    l.id === line.id ? { ...l, text: e.target.value } : l
                  );
                  setDialogueLines(updated);
                }}
                rows={2}
                placeholder="Enter what this speaker says..."
                className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
