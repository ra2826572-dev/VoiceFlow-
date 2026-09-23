import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Lock,
  Link,
  Code,
  Shield,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Voiceover Project',
  projectId = 'proj-demo-1',
}) => {
  const { success } = useToast();
  const [visibility, setVisibility] = useState<'private' | 'link' | 'public'>('link');
  const [copied, setCopied] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  if (!isOpen) return null;

  const shareUrl = `https://voiceflow.ai/share/${projectId}`;
  const embedCode = `<iframe src="${shareUrl}?embed=true" width="100%" height="160" frameborder="0" allow="autoplay"></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 shadow-2xl space-y-5 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Share Project</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Link vs Embed */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'link' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'embed' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            HTML Embed Code
          </button>
        </div>

        {/* Access Settings */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Access Permission</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'private', label: 'Private', icon: Lock },
              { id: 'link', label: 'Anyone with Link', icon: Link },
              { id: 'public', label: 'Public Index', icon: Globe },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setVisibility(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                    visibility === item.id
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Link / Embed Output */}
        {activeTab === 'link' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Shareable URL</label>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-purple-300 truncate">{shareUrl}</span>
              <button
                onClick={() => handleCopy(shareUrl)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Embed Audio Player</label>
            <div className="relative p-3 rounded-2xl bg-[#0a0b12] border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
              {embedCode}
              <button
                onClick={() => handleCopy(embedCode)}
                className="mt-2 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Embed Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Optional Password Protection */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={requirePassword}
              onChange={(e) => setRequirePassword(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span>Protect with password</span>
          </label>

          {requirePassword && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access passphrase..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};
