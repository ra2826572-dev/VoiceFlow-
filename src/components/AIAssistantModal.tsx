import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  Check,
  RotateCw,
  Copy,
  Scissors,
  FileText,
  Languages,
  Wand2,
  X,
  Minimize2,
  Maximize2,
  CornerDownLeft,
  Mic,
  MicOff,
} from 'lucide-react';
import { AIAssistantMessage } from '../types';
import { useToast } from '../context/ToastContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectName?: string;
  currentContextText?: string;
  currentScript?: string;
  onApplyTextToProject?: (newText: string) => void;
  onApplyToCurrentScript?: (newText: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentProjectName = 'Active Canvas',
  currentContextText,
  currentScript,
  onApplyTextToProject,
  onApplyToCurrentScript,
}) => {
  const effectiveContextText = currentContextText || currentScript || '';
  const effectiveApply = onApplyToCurrentScript || onApplyTextToProject;
  const { success, error: toastError } = useToast();
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your AI Studio Assistant. I have full context of your current canvas "${currentProjectName}". I can make your script more professional, clean up audio transcripts, translate, or write custom voice copy.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickPrompts: [
        'Make this script more professional',
        'Clean up transcript filler words',
        'Summarize this into 3 bullet points',
        'Convert transcript into YouTube script',
        'Translate script to Urdu',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakAssistantAudio, setSpeakAssistantAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptOverride?: string, actionOverride?: string) => {
    const promptToSend = promptOverride || inputText;
    if (!promptToSend.trim() && !actionOverride) return;

    const userMessage: AIAssistantMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      let action = actionOverride || 'chat';
      const lower = promptToSend.toLowerCase();
      if (lower.includes('professional') || lower.includes('more professional')) {
        action = 'make_professional';
      } else if (lower.includes('clean') || lower.includes('filler')) {
        action = 'cleanup_transcript';
      } else if (lower.includes('summarize') || lower.includes('summary')) {
        action = 'summarize';
      } else if (lower.includes('script') && lower.includes('convert')) {
        action = 'transcript_to_script';
      } else if (lower.includes('translate')) {
        action = 'translate';
      }

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          action,
          contextText: currentContextText,
          currentProjectName,
          speakResponse: speakAssistantAudio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const assistantMsg: AIAssistantMessage = {
        id: 'msg-ast-' + Date.now(),
        sender: 'assistant',
        text: data.text,
        appliedContent: data.updatedContent,
        audioUrl: data.audioUrl,
        actionTaken: data.actionTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If audio was generated and voice assistant audio is on, play it
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play().catch(() => {});
      }
    } catch (err: any) {
      toastError(err.message || 'AI Assistant could not complete request');
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'I ran into an issue connecting to the speech model. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyContent = (content: string) => {
    if (effectiveApply) {
      effectiveApply(content);
      success('Script updated with AI refined content!');
    }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toastError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isExpanded ? 'max-w-5xl h-[90vh]' : 'max-w-2xl h-[640px]'
        } flex flex-col rounded-3xl bg-[#0e0f17] border border-purple-500/30 shadow-2xl shadow-purple-950/40 text-slate-100 transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">VoiceFlow AI Studio Assistant</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  Context-Aware
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                Focus: <span className="text-purple-400 font-medium">{currentProjectName}</span>
                {currentContextText && (
                  <span className="text-slate-500"> ({currentContextText.length} chars loaded)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSpeakAssistantAudio(!speakAssistantAudio)}
              className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                speakAssistantAudio
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Voice Assistant Mode (Reads answers aloud)"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Voice Voiceover</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                    {/* If there is modified content that can be applied */}
                    {m.appliedContent && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 font-mono text-xs text-purple-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {m.appliedContent}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {effectiveApply && (
                            <button
                              onClick={() => handleApplyContent(m.appliedContent!)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply to Active Script</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(m.appliedContent!);
                              success('Copied to clipboard!');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Audio Preview if available */}
                    {m.audioUrl && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <audio src={m.audioUrl} controls className="h-7 w-full max-w-xs" />
                      </div>
                    )}
                  </div>

                  <span className={`block text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </span>

                  {/* Quick prompts after welcome message */}
                  {m.quickPrompts && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.quickPrompts.map((qp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-600/30 hover:border-purple-500/50 border border-slate-700/60 text-[11px] text-purple-300 transition-all text-left cursor-pointer"
                        >
                          {qp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-3 text-xs items-center text-slate-400">
              <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <RotateCw className="w-4 h-4 animate-spin" />
              </div>
              <span>AI Studio Assistant is analyzing your script...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/60 border-t border-slate-800 space-y-2">
          {/* Quick Context Action Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Quick Action:</span>
            <button
              onClick={() => handleSendMessage('Make this script more professional', 'make_professional')}
              className="px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>Make Professional</span>
            </button>
            <button
              onClick={() => handleSendMessage('Clean up transcript filler words', 'cleanup_transcript')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Scissors className="w-3 h-3 text-indigo-400" />
              <span>Clean Transcript</span>
            </button>
            <button
              onClick={() => handleSendMessage('Summarize key points', 'summarize')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3 text-emerald-400" />
              <span>Summarize</span>
            </button>
            <button
              onClick={() => handleSendMessage('Translate script to Urdu', 'translate')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Languages className="w-3 h-3 text-amber-400" />
              <span>Translate</span>
            </button>
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-xl transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Ask AI or say "Make this script more professional"...'
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />

            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
