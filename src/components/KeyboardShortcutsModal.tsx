import React from 'react';
import { Command, Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause audio preview' },
    { key: '⌘ / Ctrl + Enter', desc: 'Synthesize speech from text' },
    { key: '⌘ / Ctrl + S', desc: 'Save current project & script' },
    { key: '⌘ / Ctrl + K', desc: 'Open AI Assistant / Quick action' },
    { key: '⌘ / Ctrl + Z', desc: 'Undo text or timeline action' },
    { key: '⌘ / Ctrl + ⇧ + Z', desc: 'Redo text or timeline action' },
    { key: 'Shift + ?', desc: 'Show keyboard shortcuts' },
    { key: 'Escape', desc: 'Close open dialogs & modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 shadow-2xl space-y-4 text-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="text-slate-300">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] font-bold text-purple-300 shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 text-center pt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-400 font-mono">Esc</kbd> anytime to dismiss.
        </p>
      </div>
    </div>
  );
};
