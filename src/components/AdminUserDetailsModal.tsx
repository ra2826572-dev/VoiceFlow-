import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  CreditCard,
  BarChart3,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Plus,
  Minus,
  Download,
  Copy,
  Check,
  Calendar,
  Layers,
  FileText,
  Volume2,
  Video,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AdminManagedUser, SubscriptionTier, UserRole } from '../types';
import { useToast } from '../context/ToastContext';

interface AdminUserDetailsModalProps {
  user: AdminManagedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: AdminManagedUser) => void;
  onOpenAdjustCredits: (user: AdminManagedUser) => void;
  onOpenChangePlan: (user: AdminManagedUser) => void;
  onToggleSuspend: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUserDetailsModal: React.FC<AdminUserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onOpenAdjustCredits,
  onOpenChangePlan,
  onToggleSuspend,
  onDeleteUser,
}) => {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'usage' | 'projects' | 'activity'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'pending'>('active');

  if (!isOpen || !user) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    success(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const startEditing = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = sessionStorage.getItem('vf_admin_token') || 'vf_adm_sec_default';
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
          status: editStatus,
          isBanned: editStatus === 'suspended',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUpdateUser(data.user);
      setIsEditingProfile(false);
      success('User profile updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0e1017] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-lg font-black border border-purple-400/30 shadow-md">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0e1017] ${
                  user.status === 'active'
                    ? 'bg-emerald-500'
                    : user.status === 'suspended' || user.isBanned
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
                title={user.status}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-white">{user.name}</h2>
                {/* Role Badge */}
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                    user.role === 'super_admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === 'moderator'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {user.role.replace('_', ' ')}
                </span>
                {/* Plan Badge */}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {user.subscription} Plan
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{user.email}</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-500">ID: {user.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-900/20 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
            { id: 'usage', label: 'Usage & Quota', icon: BarChart3 },
            { id: 'projects', label: `Projects (${user.projects?.length || user.totalProjects || 0})`, icon: FolderKanban },
            { id: 'activity', label: 'Activity Logs', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditingProfile ? (
                /* Edit Profile Form */
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-purple-400" />
                    Edit User Profile & Role
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="user">User (Standard Access)</option>
                        <option value="moderator">Moderator (Content Review)</option>
                        <option value="admin">Admin (User & Platform Mgmt)</option>
                        <option value="super_admin">Super Admin (Full Root Access)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Account Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended (Banned)</option>
                        <option value="pending">Pending Verification</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Profile Summary Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">User ID</span>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
                      <span>{user.id}</span>
                      <button
                        onClick={() => handleCopy(user.id, 'User ID')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedField === 'User ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Full Name</span>
                    <div className="text-xs font-bold text-white">{user.name}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Email Address</span>
                    <div className="flex items-center justify-between text-xs font-bold text-white truncate">
                      <span className="truncate">{user.email}</span>
                      <button
                        onClick={() => handleCopy(user.email, 'Email')}
                        className="text-slate-400 hover:text-white p-1 shrink-0"
                      >
                        {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Authentication Provider</span>
                    <div className="text-xs font-bold text-purple-300 capitalize flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>{user.provider || 'Email / Password'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Email Verification</span>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{user.emailVerified ? 'Verified Account' : 'Unverified'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Account Status</span>
                    <div className="text-xs font-bold capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : user.status === 'suspended' || user.isBanned
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {user.status || (user.isBanned ? 'suspended' : 'active')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Registration Date</span>
                    <div className="text-xs font-medium text-slate-300">
                      {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Last Login</span>
                    <div className="text-xs font-medium text-slate-300">
                      {new Date(user.lastLogin).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Total Projects</span>
                    <div className="text-xs font-bold text-white">
                      {user.totalProjects || user.projects?.length || 0} Projects Created
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="p-5 rounded-2xl bg-[#141622] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => onOpenAdjustCredits(user)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>± Adjust Credits</span>
                  </button>
                  <button
                    onClick={() => onOpenChangePlan(user)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Change Plan</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleSuspend(user.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      user.isBanned || user.status === 'suspended'
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{user.isBanned || user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}</span>
                  </button>

                  {user.role !== 'super_admin' && (
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                      title="Permanently delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION & BILLING */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Active Plan</span>
                  <div className="text-2xl font-black text-white capitalize">{user.subscription}</div>
                  <p className="text-[11px] text-purple-400">
                    Status: <strong className="capitalize text-white">{user.subscriptionStatus || 'Active'}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">Next Renewal Date</span>
                  <div className="text-xl font-bold text-white">{user.renewalDate || 'Auto-renews monthly'}</div>
                  <p className="text-[11px] text-slate-500">Stripe Billing Recurring</p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-purple-300 font-semibold">Plan Management</span>
                    <p className="text-xs text-slate-300 mt-1">Upgrade or downgrade user tier instantly.</p>
                  </div>
                  <button
                    onClick={() => onOpenChangePlan(user)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Change Plan Tier
                  </button>
                </div>
              </div>

              {/* Billing Invoices History */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Billing & Invoice History
                </h3>

                {user.billingHistory && user.billingHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="p-3">Invoice #</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Tier</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {user.billingHistory.map((inv) => (
                          <tr key={inv.id} className="text-slate-300">
                            <td className="p-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                            <td className="p-3">{inv.date}</td>
                            <td className="p-3 uppercase font-bold text-purple-400">{inv.tier}</td>
                            <td className="p-3 font-bold text-white">${inv.amount.toFixed(2)}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={inv.receiptUrl || '#'}
                                onClick={(e) => {
                                  e.preventDefault();
                                  success(`Invoice ${inv.invoiceNumber} receipt downloaded.`);
                                }}
                                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-xs text-slate-500">
                    No billing transactions recorded yet for this user.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USAGE & QUOTA */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Credit Balance Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-purple-300">Available Credits Balance</span>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    {user.credits.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {user.creditsLimit?.toLocaleString() || '100,000'} limit</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Consumed {user.creditsConsumed?.toLocaleString() || user.charactersUsed.toLocaleString()} credits to date.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAdjustCredits(user)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adjust Balance</span>
                  </button>
                </div>
              </div>

              {/* Usage Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span>Characters Generated</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.charactersUsed.toLocaleString()}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Audio Generated</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.audioMinutes} mins</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span>Video Minutes</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.videoMinutes || 0} mins</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Voice Generations</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.voiceGenerations || 0} times</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>AI Writing Generations</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.aiWritingGenerations || 0} scripts</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Layers className="w-4 h-4 text-rose-400" />
                    <span>Dubbing Usage</span>
                  </div>
                  <div className="text-xl font-bold text-white">{user.dubbingUsageMinutes || 0} mins</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">User Projects ({user.projects?.length || 0})</h3>
                <span className="text-xs text-slate-400">Created media recordings & scripts</span>
              </div>

              {user.projects && user.projects.length > 0 ? (
                <div className="space-y-2.5">
                  {user.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{proj.title}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                            {proj.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          {proj.language && <span>Language: {proj.language}</span>}
                          {proj.duration > 0 && <span>Duration: {proj.duration}s</span>}
                          <span>Created: {new Date(proj.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            proj.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : proj.status === 'flagged'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/20 text-center space-y-2">
                  <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">This user has not generated any saved projects yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITY TIMELINE */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Activity Logs & Audit Trail</h3>
                <span className="text-xs text-slate-400">Chronological user actions</span>
              </div>

              {user.activityLogs && user.activityLogs.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                  {user.activityLogs.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-600 border-4 border-[#0e1017]" />
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white capitalize">
                            {act.type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{act.description}</p>
                        {act.ip && (
                          <span className="text-[10px] text-slate-500 font-mono">IP: {act.ip}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-xs text-slate-500">
                  No activity history found for this user.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
