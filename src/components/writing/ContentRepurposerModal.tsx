import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  RefreshCw,
  FileText,
  Linkedin,
  Instagram,
  Video,
  Twitter,
  Mail,
  Youtube,
  Quote,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { RepurposedContentPack } from '../../types';

interface ContentRepurposerModalProps {
  initialContent: string;
  onInsertToEditor: (text: string) => void;
  onClose: () => void;
}

export const ContentRepurposerModal: React.FC<ContentRepurposerModalProps> = ({
  initialContent,
  onInsertToEditor,
  onClose,
}) => {
  const { success, error } = useToast();
  const [sourceText, setSourceText] = useState<string>(initialContent);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pack, setPack] = useState<RepurposedContentPack | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('linkedin');

  const handleRepurpose = async () => {
    if (!sourceText.trim()) {
      error('Please provide some source content to repurpose');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceText }),
      });

      if (res.ok) {
        const data = await res.json();
        setPack(data.pack);
        success('Successfully repurposed into 9 multi-channel assets!');
      } else {
        throw new Error('Repurposing failed');
      }
    } catch {
      error('Could not repurpose content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportAll = () => {
    if (!pack) return;
    const fullText = `=== MULTI-CHANNEL REPURPOSED CONTENT PACK ===\n\n` +
      `--- LINKEDIN POST ---\n${pack.linkedinPost}\n\n` +
      `--- INSTAGRAM CAPTION ---\n${pack.instagramCaption}\n\n` +
      `--- 5 REEL IDEAS ---\n${pack.reelIdeas.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n` +
      `--- 5 YOUTUBE SHORTS ---\n${pack.youtubeShorts.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `--- X / TWITTER THREAD ---\n${pack.twitterThread.join('\n\n')}\n\n` +
      `--- EMAIL NEWSLETTER ---\n${pack.newsletter}\n\n` +
      `--- YOUTUBE SCRIPT ---\n${pack.youtubeScript}\n\n` +
      `--- QUOTE CARDS ---\n${pack.quoteCards.map((q, i) => `"${q}"`).join('\n')}\n\n` +
      `--- SUMMARY ---\n${pack.shortSummary}\n`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurposed-pack-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    success('Full content pack downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#0f1017] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131422]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>AI Content Repurposer Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  1 Input → 9 Multi-Channel Assets
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transform any article, script, or notes into ready-to-publish social campaigns.
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Input Section */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Source Text / Original Content</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {sourceText.split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={4}
              placeholder="Paste your article, video script, speech, or meeting notes here..."
              className="w-full bg-[#0a0b10] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                AI will extract core hooks, narrative arcs, and platform-native formats.
              </span>
              <button
                onClick={handleRepurpose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isProcessing ? 'Repurposing with Gemini 3.8...' : 'Repurpose into 9 Assets'}</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          {pack ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'linkedin', label: 'LinkedIn Post', icon: Linkedin },
                    { id: 'instagram', label: 'Instagram Caption', icon: Instagram },
                    { id: 'reels', label: '5 Reel Ideas', icon: Video },
                    { id: 'shorts', label: '5 YouTube Shorts', icon: Youtube },
                    { id: 'thread', label: 'X (Twitter) Thread', icon: Twitter },
                    { id: 'newsletter', label: 'Email Newsletter', icon: Mail },
                    { id: 'script', label: 'YouTube Script', icon: Youtube },
                    { id: 'quotes', label: 'Quote Cards', icon: Quote },
                    { id: 'summary', label: 'Summary', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleExportAll}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Export All (.txt)</span>
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                {activeTab === 'linkedin' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Linkedin className="w-4 h-4 text-blue-400" />
                        <span>Thought-Leadership LinkedIn Post</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(pack.linkedinPost, 'linkedin')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedKey === 'linkedin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            onInsertToEditor(pack.linkedinPost);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Insert to Editor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-[#0a0b10] p-4 rounded-xl border border-slate-800/80">
                      {pack.linkedinPost}
                    </pre>
                  </div>
                )}

                {activeTab === 'instagram' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <span>Instagram Carousel / Post Caption</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(pack.instagramCaption, 'instagram')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedKey === 'instagram' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            onInsertToEditor(pack.instagramCaption);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Insert to Editor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-[#0a0b10] p-4 rounded-xl border border-slate-800/80">
                      {pack.instagramCaption}
                    </pre>
                  </div>
                )}

                {activeTab === 'reels' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-purple-400" />
                        <span>5 High-Converting Instagram Reel Hook Concepts</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {pack.reelIdeas.map((idea, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0a0b10] border border-slate-800 flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                              Reel Concept #{idx + 1}
                            </span>
                            <p className="text-xs text-slate-200 font-medium leading-snug">{idea}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(idea, `reel-${idx}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0"
                          >
                            {copiedKey === `reel-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'shorts' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Youtube className="w-4 h-4 text-red-400" />
                        <span>5 YouTube Shorts Frameworks</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {pack.youtubeShorts.map((short, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0a0b10] border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                              Shorts Blueprint #{idx + 1}
                            </span>
                            <p className="text-xs text-slate-200 leading-snug">{short}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(short, `short-${idx}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0"
                          >
                            {copiedKey === `short-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'thread' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Twitter className="w-4 h-4 text-sky-400" />
                        <span>5-Tweet Viral X Thread</span>
                      </span>
                      <button
                        onClick={() => handleCopy(pack.twitterThread.join('\n\n'), 'thread')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        {copiedKey === 'thread' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Entire Thread</span>
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {pack.twitterThread.map((tweet, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#0a0b10] border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px] shrink-0 font-mono">
                            {idx + 1}/5
                          </span>
                          <p className="flex-1">{tweet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'newsletter' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span>Email Newsletter Section</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(pack.newsletter, 'newsletter')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedKey === 'newsletter' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            onInsertToEditor(pack.newsletter);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Insert to Editor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-[#0a0b10] p-4 rounded-xl border border-slate-800/80">
                      {pack.newsletter}
                    </pre>
                  </div>
                )}

                {activeTab === 'script' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>YouTube Video Script</span>
                      </span>
                      <button
                        onClick={() => {
                          onInsertToEditor(pack.youtubeScript);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Open in Editor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-[#0a0b10] p-4 rounded-xl border border-slate-800/80">
                      {pack.youtubeScript}
                    </pre>
                  </div>
                )}

                {activeTab === 'quotes' && (
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Quote className="w-4 h-4 text-amber-400" />
                        <span>Punchy Quote Cards</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {pack.quoteCards.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-gradient-to-br from-[#121422] to-[#0c0d15] border border-slate-800 flex flex-col justify-between space-y-3 shadow-md"
                        >
                          <p className="text-xs font-serif italic text-slate-100 leading-relaxed">
                            "{q}"
                          </p>
                          <button
                            onClick={() => handleCopy(q, `quote-${idx}`)}
                            className="self-end px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1"
                          >
                            {copiedKey === `quote-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Executive Summary</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-[#0a0b10] p-4 rounded-xl border border-slate-800">
                      {pack.shortSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Share2 className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">Click "Repurpose into 9 Assets" above to generate all multi-platform formats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
