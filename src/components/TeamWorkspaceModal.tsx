import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { TeamWorkspaceRecord, TeamMemberRecord } from '../types';

interface TeamWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamWorkspaceModal: React.FC<TeamWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { success, error: toastError } = useToast();
  const [workspace, setWorkspace] = useState<TeamWorkspaceRecord | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/teams')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.workspace) setWorkspace(data.workspace);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (workspace) {
        setWorkspace({
          ...workspace,
          members: [...workspace.members, data.member],
        });
      }
      setInviteEmail('');
      success(`Invitation sent to ${inviteEmail}!`);
    } catch (err: any) {
      toastError(err.message || 'Invitation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    if (workspace) {
      setWorkspace({
        ...workspace,
        members: workspace.members.filter((m) => m.id !== id),
      });
      success('Team member removed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 shadow-2xl space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {workspace?.name || 'Studio Velocity Workspace'}
              </h3>
              <p className="text-xs text-slate-400">Collaborate with voice editors and audio engineers.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Invite Team Collaborator</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Workspace Members ({workspace?.members.length || 0})</span>
            <span className="text-[11px] text-purple-400">Seats available: 3</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {workspace?.members.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{m.name}</div>
                    <div className="text-[11px] text-slate-500">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      m.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300'
                        : m.role === 'editor'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.role}
                  </span>

                  {m.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
