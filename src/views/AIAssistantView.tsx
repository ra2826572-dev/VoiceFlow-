import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Wand2,
  Scissors,
  FileText,
  Languages,
  Copy,
  Check,
  Volume2,
  Mic,
  RotateCw,
  HelpCircle,
  Film,
  Zap,
} from 'lucide-react';
import { AIAssistantMessage } from '../types';
import { useToast } from '../context/ToastContext';
import { useUsage } from '../context/UsageContext';
import { useAuth } from '../context/AuthContext';

interface AIAssistantViewProps {
  onNavigateToVoiceStudio?: (scriptText: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onNavigateToVoiceStudio }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { checkLimit, showLimitModal, refreshUsage } = useUsage();
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "👋 Welcome to the VoiceFlow Integrated AI Studio Assistant! I can help you draft viral YouTube & TikTok scripts, clean noisy transcripts into broadcast-ready copy, translate dialogue into 15+ languages, or fine-tune vocal pacing.",
      timestamp: '10:00 AM',
      quickPrompts: [
        'Write a 60-second YouTube shorts script on AI speech',
        'Clean up transcript filler words and stutter',
        'Convert this conversation into a multi-character podcast script',
        'Translate script to Urdu and Roman Urdu',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'assistant' | 'tools'>('assistant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleSend = async (customPrompt?: string, actionName?: string) => {
    const prompt = customPrompt || inputText;
    if (!prompt.trim() && !actionName) return;

    const userMsg: AIAssistantMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    if (!checkLimit('OTHER_AI')) {
      showLimitModal('OTHER_AI');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          prompt,
          action: actionName || 'chat',
          language: selectedLanguage,
          speakResponse: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.code === 'LIMIT_REACHED') {
          showLimitModal('OTHER_AI');
          setIsProcessing(false);
          return;
        }
        throw new Error(data.error || 'Assistant failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'asst-' + Date.now(),
          sender: 'assistant',
          text: data.text,
          appliedContent: data.updatedContent,
          audioUrl: data.audioUrl,
          actionTaken: data.actionTaken,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      refreshUsage();
    } catch (err: any) {
      toastError(err.message || 'Failed to process assistant request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrated Studio Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Assistant & Speech Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Chat with our speech intelligence engine. Automatically refine scripts, summarize recorded transcripts,
            translate voice lines, and inject professional vocal cadence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
          >
            <option value="English">Target: English</option>
            <option value="Urdu">Target: Urdu</option>
            <option value="Roman Urdu">Target: Roman Urdu</option>
            <option value="Hindi">Target: Hindi</option>
            <option value="Arabic">Target: Arabic</option>
          </select>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Assistant Tools Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-[#12131b] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Studio Quick Tasks
            </h3>

            <div className="space-y-2">
              <button
                onClick={() =>
                  handleSend(
                    'Rewrite my current script into an ultra-professional broadcast voiceover with natural pauses.',
                    'make_professional'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-200 transition-all flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold">Make Professional</span>
              </button>

              <button
                onClick={() =>
                  handleSend(
                    'Clean up all filler words ("um", "uh", "you know"), stutters and bad punctuation from my transcript.',
                    'cleanup_transcript'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-200 transition-all flex items-center gap-2"
              >
                <Scissors className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold">Transcript Cleanup</span>
              </button>

              <button
                onClick={() =>
                  handleSend(
                    'Summarize the core takeaways and key thoughts into 3 concise bullet points.',
                    'summarize'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-200 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Summarize Content</span>
              </button>

              <button
                onClick={() =>
                  handleSend(
                    'Convert my spoken transcript into an engaging YouTube video script with hook, body points and outro.',
                    'transcript_to_script'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-200 transition-all flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">Transcript → Script</span>
              </button>

              <button
                onClick={() =>
                  handleSend('Translate this text into fluent, natural spoken Urdu.', 'translate')
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-200 transition-all flex items-center gap-2"
              >
                <Languages className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Neural Translation</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Context Engine Active</span>
            </div>
            <p className="text-[11px] text-purple-300/80 leading-relaxed">
              The assistant retains conversation memory and passes generated copy straight to Text-to-Voice synthesis.
            </p>
          </div>
        </div>

        {/* Right Chat Flow View */}
        <div className="lg:col-span-3 flex flex-col h-[600px] rounded-3xl bg-[#0f1019] border border-slate-800 overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-4 rounded-2xl ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-tr-xs'
                          : 'bg-[#151624] border border-slate-800 text-slate-200 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                      {/* Applied content card if present */}
                      {m.appliedContent && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 font-mono text-xs text-purple-200 whitespace-pre-wrap max-h-52 overflow-y-auto">
                            {m.appliedContent}
                          </div>
                          <div className="flex items-center gap-2">
                            {onNavigateToVoiceStudio && (
                              <button
                                onClick={() => onNavigateToVoiceStudio(m.appliedContent!)}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Send to Voice Studio</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(m.appliedContent!);
                                success('Copied to clipboard!');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Text</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Voice Audio Preview */}
                      {m.audioUrl && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-purple-400" />
                          <audio src={m.audioUrl} controls className="h-7 w-full max-w-sm" />
                        </div>
                      )}
                    </div>

                    <span className={`block text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                      {m.timestamp}
                    </span>

                    {/* Quick prompts */}
                    {m.quickPrompts && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.quickPrompts.map((qp, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(qp)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 hover:border-purple-500/50 border border-slate-700/60 text-[11px] text-purple-300 transition-all text-left cursor-pointer"
                          >
                            {qp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3 text-xs items-center text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <RotateCw className="w-4 h-4 animate-spin" />
                </div>
                <span>Synthesizing intelligent assistant response...</span>
              </div>
            )}
          </div>

          {/* Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or request script rewrite..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
