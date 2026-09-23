import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table,
  Undo,
  Redo,
  Sparkles,
  Wand2,
  Check,
  Scissors,
  Maximize2,
  Minimize2,
  Languages,
  CheckCheck,
  Volume2,
  Zap,
} from 'lucide-react';

interface WritingSmartEditorProps {
  content: string;
  onChange: (text: string) => void;
  onAiAction: (action: string, customInstruction?: string) => void;
  onTranslate?: (targetLanguage: string) => void;
  onSendToVoice?: (text: string) => void;
  placeholder?: string;
  isGenerating?: boolean;
}

export const WritingSmartEditor: React.FC<WritingSmartEditorProps> = ({
  content,
  onChange,
  onAiAction,
  onTranslate,
  onSendToVoice,
  placeholder = 'Write your content here, or use / for AI commands...',
  isGenerating = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>('');
  const [slashMenuPos, setSlashMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [autocompleteGhost, setAutocompleteGhost] = useState<string>('');
  const [isFetchingAutocomplete, setIsFetchingAutocomplete] = useState<boolean>(false);
  const [showTranslateDropdown, setShowTranslateDropdown] = useState<boolean>(false);
  const autocompleteTimerRef = useRef<any>(null);

  // Sync internal history on external changes
  useEffect(() => {
    if (content !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  // Statistics calculation
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readingTimeSec = Math.max(1, Math.round(words / 3.3));
  const speakingTimeSec = Math.max(1, Math.round(words / 2.3));

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const updateContent = (newText: string) => {
    onChange(newText);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Text formatting insertion helpers
  const wrapSelection = (before: string, after: string = before, placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    updateContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertAtCursor = (insertion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + insertion + text.substring(end);
    updateContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  // Selection tracking
  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      setSelectedText(textarea.value.substring(start, end));
    } else {
      setSelectedText('');
    }
  };

  // Keyboard navigation & slash commands & autocomplete handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Autocomplete TAB accept
    if (e.key === 'Tab' && autocompleteGhost) {
      e.preventDefault();
      insertAtCursor(autocompleteGhost);
      setAutocompleteGhost('');
      return;
    }

    // Dismiss ghost on Escape
    if (e.key === 'Escape') {
      setAutocompleteGhost('');
      setShowSlashMenu(false);
      return;
    }

    // Slash command trigger
    if (e.key === '/') {
      const textarea = textareaRef.current;
      if (textarea) {
        setShowSlashMenu(true);
        setSlashQuery('');
      }
    }
  };

  // Handle input changes and debounced autocomplete trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    updateContent(val);

    // Trigger AI inline autocomplete if user paused after typing 10+ characters
    if (autocompleteTimerRef.current) clearTimeout(autocompleteTimerRef.current);
    if (val.trim().length > 15 && !val.endsWith('\n')) {
      autocompleteTimerRef.current = setTimeout(async () => {
        try {
          setIsFetchingAutocomplete(true);
          const lastSentence = val.slice(-120);
          const res = await fetch('/api/ai/autocomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prefix: lastSentence }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.suggestion && data.suggestion.trim()) {
              setAutocompleteGhost(data.suggestion);
            }
          }
        } catch {
          // ignore autocomplete network hiccups
        } finally {
          setIsFetchingAutocomplete(false);
        }
      }, 1200);
    } else {
      setAutocompleteGhost('');
    }
  };

  const slashCommands = [
    { label: 'Rewrite Section', desc: 'Rephrase with fresh vocabulary', action: 'rewrite' },
    { label: 'Improve Flow & Clarity', desc: 'Elevate rhythm and polish', action: 'improve' },
    { label: 'Shorten & Condense', desc: 'Make 40% more concise', action: 'shorten' },
    { label: 'Expand Details', desc: 'Add rich examples & context', action: 'expand' },
    { label: 'Fix Grammar & Spelling', desc: 'Proofread syntax and punctuation', action: 'grammar' },
    { label: 'Make Professional', desc: 'Enterprise C-suite tone', action: 'professional' },
    { label: 'Make Simple', desc: 'Clear 5th-grade reading level', action: 'simple' },
    { label: 'Make More Persuasive', desc: 'High-converting direct response', action: 'persuasive' },
    { label: 'Summarize Key Takeaways', desc: 'Bulleted executive summary', action: 'summarize' },
    { label: 'Continue Writing', desc: 'AI generates next paragraph', action: 'continue' },
  ];

  const filteredCommands = slashCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      c.action.toLowerCase().includes(slashQuery.toLowerCase())
  );

  return (
    <div className="rounded-3xl bg-[#0f1017] border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all">
      {/* 1. Rich Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#141522] border-b border-slate-800/80">
        {/* Left Toolbar: Text formatting */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Heading buttons */}
          <button
            type="button"
            onClick={() => wrapSelection('# ', '', 'Heading 1')}
            title="Heading 1"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('## ', '', 'Heading 2')}
            title="Heading 2"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('### ', '', 'Heading 3')}
            title="Heading 3"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<u>', '</u>', 'underlined')}
            title="Underline"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Lists and Quotes */}
          <button
            type="button"
            onClick={() => wrapSelection('- ', '', 'List item')}
            title="Bullet List"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('1. ', '', 'Numbered item')}
            title="Numbered List"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('> ', '', 'Quote statement')}
            title="Blockquote"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('`', '`', 'code')}
            title="Inline Code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('[', '](https://example.com)', 'Link Text')}
            title="Insert Link"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolbar: AI quick triggers & Real-time Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSendToVoice && (
            <button
              type="button"
              onClick={() => onSendToVoice(content)}
              title="Send directly to Voice Studio"
              className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Studio</span>
            </button>
          )}

          {/* Metrics Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-white font-bold">{words}</span>
            <span>words</span>
            <span className="text-slate-600">•</span>
            <span className="text-white font-bold">{chars}</span>
            <span>chars</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-300 font-semibold" title="Estimated reading time">
              ~{formatDuration(readingTimeSec)} read
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold" title="Estimated speech duration">
              🎙️ ~{formatDuration(speakingTimeSec)} voice
            </span>
          </div>
        </div>
      </div>

      {/* 2. Floating AI Selection Toolbar when text is highlighted */}
      {selectedText && (
        <div className="bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-b border-purple-500/40 px-4 py-2 flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs text-purple-200 font-medium truncate max-w-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">"{selectedText.substring(0, 35)}..."</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onAiAction('improve', selectedText)}
              className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Wand2 className="w-3 h-3" />
              <span>Improve</span>
            </button>
            <button
              type="button"
              onClick={() => onAiAction('rewrite', selectedText)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Rewrite
            </button>
            <button
              type="button"
              onClick={() => onAiAction('shorten', selectedText)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Shorten
            </button>
            <button
              type="button"
              onClick={() => onAiAction('expand', selectedText)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={() => onAiAction('grammar', selectedText)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Fix Grammar
            </button>

            {/* Translate Dropdown */}
            {onTranslate && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTranslateDropdown(!showTranslateDropdown)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Languages className="w-3 h-3" />
                  <span>Translate</span>
                </button>
                {showTranslateDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-30">
                    {[
                      { code: 'Urdu', label: 'Urdu (اردو)' },
                      { code: 'Roman Urdu', label: 'Roman Urdu' },
                      { code: 'English', label: 'English' },
                      { code: 'Hindi', label: 'Hindi (हिन्दी)' },
                      { code: 'Arabic', label: 'Arabic (العربية)' },
                      { code: 'Spanish', label: 'Spanish' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onTranslate(lang.code);
                          setShowTranslateDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-purple-600 hover:text-white"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Text Area with Autocomplete Overlay */}
      <div className="relative flex-1 min-h-[360px] p-4 flex flex-col bg-[#0f1017]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none text-sm leading-relaxed resize-none font-sans font-normal selection:bg-purple-500/30"
          style={{ minHeight: '340px' }}
        />

        {/* Inline AI Autocomplete Ghost Indicator */}
        {autocompleteGhost && (
          <div className="mt-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-200">
              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="font-mono text-slate-400">AI suggestion:</span>
              <span className="italic text-purple-300">"{autocompleteGhost}"</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  insertAtCursor(autocompleteGhost);
                  setAutocompleteGhost('');
                }}
                className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px]"
              >
                Press Tab to Accept
              </button>
              <button
                type="button"
                onClick={() => setAutocompleteGhost('')}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 4. Slash Command Popup Menu */}
        {showSlashMenu && (
          <div className="absolute left-6 bottom-12 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-40 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 mb-1 flex items-center justify-between">
              <span>AI Slash Commands</span>
              <span className="text-[9px] text-slate-500">Esc to close</span>
            </div>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.action}
                type="button"
                onClick={() => {
                  setShowSlashMenu(false);
                  onAiAction(cmd.action);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-purple-600/30 text-xs text-slate-200 hover:text-white transition-colors flex flex-col group cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1.5 group-hover:text-purple-300">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>/{cmd.action} — {cmd.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{cmd.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12131e] border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>Type <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">/</kbd> for AI commands</span>
          <span>•</span>
          <span>Highlight text for AI toolbar</span>
        </div>
        <div>
          {isGenerating ? (
            <span className="text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              Generating with Gemini 3.8 Flash...
            </span>
          ) : (
            <span className="text-emerald-400 font-mono">✓ Ready</span>
          )}
        </div>
      </div>
    </div>
  );
};
