import React, { useState, useEffect } from 'react';
import {
  Code2,
  Key,
  Webhook,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  RotateCw,
  Clock,
  Layers,
} from 'lucide-react';
import { ApiKeyRecord, WebhookRecord } from '../types';
import { useToast } from '../context/ToastContext';

export const ApiPlatformView: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [justGeneratedKey, setJustGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/developer/keys')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.keys) setKeys(data.keys);
          if (data.webhooks) setWebhooks(data.webhooks);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKeys((prev) => [data.key, ...prev]);
      setJustGeneratedKey(data.secretKeyOnce);
      setNewKeyName('');
      success('API Key generated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Key generation failed');
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Revoke failed');
      setKeys((prev) => prev.filter((k) => k.id !== id));
      success('API key revoked.');
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.voiceflow.ai/v1/tts/synthesize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Welcome to VoiceFlow AI. Neural speech at your fingertips.",
    "voiceId": "zara-urdu-natural",
    "language": "ur",
    "speed": 1.0,
    "format": "mp3"
  }'`,
    node: `import { VoiceFlowAI } from '@voiceflow/ai-sdk';

const client = new VoiceFlowAI({ apiKey: process.env.VOICEFLOW_API_KEY });

const response = await client.tts.synthesize({
  text: "Welcome to VoiceFlow AI. Neural speech at your fingertips.",
  voiceId: "zara-urdu-natural",
  language: "ur",
  speed: 1.0,
  format: "mp3"
});

console.log('Audio URL:', response.audioUrl);`,
    python: `import requests

url = "https://api.voiceflow.ai/v1/tts/synthesize"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "text": "Welcome to VoiceFlow AI. Neural speech at your fingertips.",
    "voiceId": "zara-urdu-natural",
    "language": "ur",
    "speed": 1.0,
    "format": "mp3"
}

response = requests.post(url, json=payload, headers=headers)
audio_data = response.json()
print(audio_data["audioUrl"])`,
  };

  return (
    <div id="developer-api-platform" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Platform Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-[#121324] border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Platform & REST API</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">VoiceFlow AI API</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Integrate neural text-to-speech, voice cloning, speech-to-text, and automated dubbing into your applications.
          </p>
        </div>

        <button
          onClick={() => {
            setJustGeneratedKey(null);
            setIsGenerateModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New API Key</span>
        </button>
      </div>

      {/* API Keys Table */}
      <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>Active API Keys</span>
            </h3>
            <p className="text-xs text-slate-400">Keep secret keys secure. Never expose in client code.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-3 font-semibold">Key Name</th>
                <th className="pb-3 font-semibold">Token Identifier</th>
                <th className="pb-3 font-semibold">Rate Limit</th>
                <th className="pb-3 font-semibold">Created</th>
                <th className="pb-3 font-semibold text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {keys.map((k) => (
                <tr key={k.id} className="text-slate-300">
                  <td className="py-3 font-bold text-white">{k.name}</td>
                  <td className="py-3 font-mono text-purple-300">{k.keyMasked}</td>
                  <td className="py-3">{k.rateLimitPerMin} req / min</td>
                  <td className="py-3">{k.createdAt.split('T')[0]}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleRevokeKey(k.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Code Documentation */}
      <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Quickstart Code Examples</span>
            </h3>
            <p className="text-xs text-slate-400">Synthesize audio in seconds with our multi-language endpoint.</p>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['curl', 'node', 'python'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCodeTab === lang
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : 'Python'}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-2xl bg-[#0b0c13] border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
          <button
            onClick={() => {
              navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
              success('Code snippet copied!');
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Copy snippet"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <pre className="whitespace-pre">{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>

      {/* Webhooks Manager */}
      <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-cyan-400" />
              <span>Webhook Endpoints</span>
            </h3>
            <p className="text-xs text-slate-400">Receive instant asynchronous events for video dubbing & batch TTS.</p>
          </div>
        </div>

        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-mono text-xs text-purple-300 font-semibold">{wh.url}</div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Events: {wh.events.join(', ')}</span>
                  <span>•</span>
                  <span>Secret: {wh.secretMasked}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase w-fit">
                {wh.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Generation Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Developer API Key</h3>

            {!justGeneratedKey ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter a friendly name for this key to track where it is being used.
                </p>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Mobile Production App"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Save this secret key now. It will not be shown again.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-purple-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{justGeneratedKey}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(justGeneratedKey);
                      success('Copied secret key!');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
