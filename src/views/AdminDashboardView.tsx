import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Mic,
  FolderKanban,
  CreditCard,
  BarChart3,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Activity,
  Headphones,
  Film,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Bell,
  Clock,
  Shield,
  Layers,
  AlertTriangle,
  UserCheck,
  UserX,
  Radio,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  AdminManagedUser,
  AdminAnalyticsMetrics,
  AdminLiveEvent,
  SubscriptionTier,
  UserRole,
} from '../types';
import { AdminUserDetailsModal } from '../components/AdminUserDetailsModal';

interface AdminDashboardViewProps {
  onLock?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onLock }) => {
  const { success, error: toastError, info } = useToast();
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'users' | 'live-feed' | 'audit-logs' | 'voices' | 'projects'
  >('users');

  // Metrics & State
  const [metrics, setMetrics] = useState<AdminAnalyticsMetrics | null>(null);
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [liveEvents, setLiveEvents] = useState<AdminLiveEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters, Search, Sort & Pagination
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('joined');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);

  // Modals
  const [detailUser, setDetailUser] = useState<AdminManagedUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [creditUser, setCreditUser] = useState<AdminManagedUser | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(25000);
  const [creditReason, setCreditReason] = useState<string>('Promotional Grant');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [planUser, setPlanUser] = useState<AdminManagedUser | null>(null);
  const [targetTier, setTargetTier] = useState<SubscriptionTier>('pro');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminManagedUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Voices & Projects Moderation
  const [adminVoices, setAdminVoices] = useState([
    { id: 'v-1', name: 'Zara Khan (Urdu Natural)', language: 'Urdu', category: 'Narrator', isPublic: true, uses: 18400 },
    { id: 'v-2', name: 'David Sterling (US Authority)', language: 'English', category: 'Professional', isPublic: true, uses: 15200 },
    { id: 'v-3', name: 'Aria Cinematic', language: 'English', category: 'Cinematic', isPublic: true, uses: 9400 },
    { id: 'v-4', name: 'Hamza Voice Clone #1', language: 'Urdu', category: 'Podcast', isPublic: false, uses: 1200 },
  ]);

  const [systemProjects, setSystemProjects] = useState([
    { id: 'p-1', name: 'Urdu Historical Podcast Ep 12', author: 'Rizwan Ahmad', type: 'audio', status: 'clean', created: '2026-03-01' },
    { id: 'p-2', name: 'Global Tech News Briefing', author: 'Sarah Jenkins', type: 'video', status: 'clean', created: '2026-03-02' },
    { id: 'p-3', name: 'Automated Crypto Promotion 2026', author: 'Spam Bot 99', type: 'script', status: 'flagged', created: '2026-03-03' },
  ]);

  // Auth Headers helper for RBAC enforcement
  const getAdminHeaders = useCallback(() => {
    const token = sessionStorage.getItem('vf_admin_token') || 'vf_adm_sec_default';
    const storedUser = localStorage.getItem('voiceflow_user');
    let email = 'ra2826572@gmail.com';
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) email = parsed.email;
      }
    } catch {}
    return {
      'x-admin-token': token,
      'x-user-email': email,
      'Content-Type': 'application/json',
    };
  }, []);

  // Load Data
  const loadMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {}
  }, [getAdminHeaders]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        quickFilter,
        plan: selectedPlan,
        status: selectedStatus,
        role: selectedRole,
        provider: selectedProvider,
        sortBy,
        sortOrder,
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsersCount(data.total || data.users?.length || 0);
      }
    } catch (e) {
      toastError('Failed to fetch users list');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, quickFilter, selectedPlan, selectedStatus, selectedRole, selectedProvider, sortBy, sortOrder, currentPage, itemsPerPage, getAdminHeaders]);

  const loadLogsAndEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activity-logs', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.liveEvents) setLiveEvents(data.liveEvents);
      }
    } catch {}
  }, [getAdminHeaders]);

  useEffect(() => {
    loadMetrics();
    loadUsers();
    loadLogsAndEvents();
  }, [loadMetrics, loadUsers, loadLogsAndEvents]);

  // Real-time automatic polling every 4s so newly registered users immediately appear without reload
  useEffect(() => {
    const timer = setInterval(() => {
      loadUsers();
      loadLogsAndEvents();
      loadMetrics();
    }, 4000);
    return () => clearInterval(timer);
  }, [loadUsers, loadLogsAndEvents, loadMetrics]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadMetrics(), loadUsers(), loadLogsAndEvents()]);
    setIsRefreshing(false);
    success('Admin console data synchronized in real-time.');
  };

  // Quick Actions Handlers
  const handleToggleBan = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-ban`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isBanned: data.isBanned, status: data.status }
            : u
        )
      );
      if (detailUser?.id === userId) {
        setDetailUser((prev) =>
          prev ? { ...prev, isBanned: data.isBanned, status: data.status } : null
        );
      }
      success(`User account is now ${data.status.toUpperCase()}`);
      loadLogsAndEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status');
    }
  };

  const handleAdjustCreditsSubmit = async () => {
    if (!creditUser) return;
    try {
      const res = await fetch(`/api/admin/users/${creditUser.id}/adjust-credits`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ amount: creditAmount, reason: creditReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) => (u.id === creditUser.id ? { ...u, credits: data.newBalance } : u))
      );
      if (detailUser?.id === creditUser.id) {
        setDetailUser((prev) => (prev ? { ...prev, credits: data.newBalance } : null));
      }
      success(`Successfully adjusted credits for ${creditUser.name}!`);
      setIsCreditModalOpen(false);
      loadLogsAndEvents();
    } catch (err: any) {
      toastError(err.message || 'Credit adjustment failed');
    }
  };

  const handleChangePlanSubmit = async () => {
    if (!planUser) return;
    try {
      const res = await fetch(`/api/admin/users/${planUser.id}/change-plan`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ tier: targetTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) => (u.id === planUser.id ? { ...u, ...data.user } : u))
      );
      if (detailUser?.id === planUser.id) {
        setDetailUser((prev) => (prev ? { ...prev, ...data.user } : null));
      }
      success(`User subscription upgraded to ${targetTier.toUpperCase()}!`);
      setIsPlanModalOpen(false);
      loadLogsAndEvents();
    } catch (err: any) {
      toastError(err.message || 'Plan change failed');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setIsDetailOpen(false);
      success('User permanently deleted from database.');
      loadLogsAndEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete user');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/export-csv', {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voiceflow_users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('Exported users database to CSV successfully!');
    } catch {
      toastError('Failed to export CSV');
    }
  };

  const handleClearAllUsers = async () => {
    if (!window.confirm('Are you sure you want to remove ALL users currently in the Admin Panel? This will clear the user database.')) return;
    try {
      const res = await fetch('/api/admin/clear-all-users', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers([]);
      success('All users have been removed from the Admin Panel.');
      loadMetrics();
      loadLogsAndEvents();
    } catch (err: any) {
      toastError(err.message || 'Failed to clear users');
    }
  };

  const handleOpenUserDetail = (u: AdminManagedUser) => {
    setDetailUser(u);
    setIsDetailOpen(true);
  };

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-[#10121d] border border-purple-500/20 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Administrator Security Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <span>VoiceFlow AI Admin Suite</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              Live v3.4
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Automatic user syncing, multi-role governance (RBAC), subscription billing, and real-time activity tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Data */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Sync all backend records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Sync Live</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Remove All Users */}
          <button
            onClick={handleClearAllUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Remove all registered users from database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove All Users</span>
          </button>

          {/* Lock Console */}
          <button
            onClick={() => {
              sessionStorage.removeItem('vf_admin_unlocked');
              success('Admin console locked.');
              if (onLock) onLock();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
        {[
          { id: 'users', label: `Users Management (${totalUsersCount || users.length})`, icon: Users },
          { id: 'analytics', label: 'KPIs & SaaS Analytics', icon: BarChart3 },
          { id: 'live-feed', label: 'Real-time Updates Feed', icon: Radio, badge: liveEvents.length },
          { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck },
          { id: 'voices', label: 'Voices Moderation', icon: Mic },
          { id: 'projects', label: 'Projects Audit', icon: FolderKanban },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS MANAGEMENT (Core User Request) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Filters Bar */}
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-[#12131e] border border-slate-800 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>Filter Users:</span>
            </span>
            {[
              { id: 'all', label: 'All Users' },
              { id: 'new', label: 'New Users' },
              { id: 'active', label: 'Active Users' },
              { id: 'inactive', label: 'Inactive Users' },
              { id: 'free', label: 'Free Plan' },
              { id: 'pro', label: 'Pro Plan' },
              { id: 'premium', label: 'Premium Plan' },
              { id: 'suspended', label: 'Suspended' },
              { id: 'verified', label: 'Verified' },
              { id: 'unverified', label: 'Unverified' },
            ].map((f) => {
              const isSelected = quickFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setQuickFilter(f.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Quick Filter & Search Toolbar */}
          <div className="p-5 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search users by name, email, or user ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Plan Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold text-[11px]">Plan:</span>
                  <select
                    value={selectedPlan}
                    onChange={(e) => {
                      setSelectedPlan(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="creator">Creator</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold text-[11px]">Role:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="joined">Sort: Joined Date</option>
                    <option value="lastLogin">Sort: Last Login</option>
                    <option value="credits">Sort: Credits</option>
                    <option value="name">Sort: Name</option>
                    <option value="usage">Sort: Audio Usage</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-purple-400 font-bold px-1 hover:text-white"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl border border-slate-800 bg-[#12131e] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-bold">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email & Auth</th>
                    <th className="py-3.5 px-4">Plan & Logins</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">Usage & Projects</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                        <span>Loading managed users...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 px-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1.5">No Registered Users</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          All users have been wiped. When a new user signs up or logs into Voice Flow AI (via Email or Google SSO), their profile, auth credentials, and usage statistics will automatically appear here in real-time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSuspended = u.status === 'suspended' || u.isBanned;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                          onClick={() => handleOpenUserDetail(u)}
                        >
                          {/* User Name, ID & Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-purple-500/20"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'super_admin' && (
                                    <span title="Super Admin">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                      u.role === 'super_admin'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : u.role === 'admin'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : u.role === 'moderator'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {u.role.replace('_', ' ')}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-500" title={u.id}>
                                    ID: {u.id.length > 12 ? `${u.id.substring(0, 10)}...` : u.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email & Auth Provider */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-0.5">
                              <div className="font-medium text-slate-200">{u.email}</div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="capitalize font-mono text-purple-400">{u.provider || 'email'}</span>
                                <span>•</span>
                                <span className={u.emailVerified ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                                  {u.emailVerified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Plan & Logins */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {u.subscription}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              {u.loginCount || 1} logins
                            </div>
                          </td>

                          {/* Credits Balance */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white">
                              {u.credits?.toLocaleString() || 0}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Used {u.charactersUsed?.toLocaleString() || 0} chars
                            </div>
                          </td>

                          {/* Usage & Projects */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium">
                              {u.totalProjects || u.projects?.length || 0} projects • {u.voiceGenerations || 0} voices
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>Audio: {u.audioMinutes || 0}m</span>
                              <span>•</span>
                              <span>Video: {u.videoMinutes || 0}m</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isSuspended
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              <span>{isSuspended ? 'Suspended' : 'Active'}</span>
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-4 text-slate-400 font-medium whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4 text-slate-400 font-medium whitespace-nowrap">
                            {new Date(u.lastLogin).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => handleOpenUserDetail(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="View User Profile, Usage & Projects"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => handleOpenUserDetail(u)}
                                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors cursor-pointer"
                                title="Edit User Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Adjust Credits */}
                              <button
                                onClick={() => {
                                  setCreditUser(u);
                                  setIsCreditModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors cursor-pointer"
                                title="Add/Remove Credits"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* Change Plan */}
                              <button
                                onClick={() => {
                                  setPlanUser(u);
                                  setTargetTier(u.subscription);
                                  setIsPlanModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-colors cursor-pointer"
                                title="Change Plan Tier"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Unsuspend */}
                              <button
                                onClick={() => handleToggleBan(u.id)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                }`}
                                title={isSuspended ? 'Unsuspend User' : 'Suspend User'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete (non super admin) */}
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-900/40 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-bold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>users per page • Total {totalUsersCount} registered users</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & KPIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#12131e] border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Registered Users</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {metrics?.totalUsers !== undefined ? metrics.totalUsers.toLocaleString() : '0'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{metrics?.newUsersToday || 0} new users today</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#12131e] border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Monthly Revenue (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">
                ${metrics?.totalRevenue !== undefined ? metrics.totalRevenue.toLocaleString() : '0'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Revenue Stream</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#12131e] border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total AI Speech Generations</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {metrics?.aiGenerationsTotal !== undefined ? metrics.aiGenerationsTotal.toLocaleString() : '0'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>{metrics?.totalAudioMinutes || 0} audio minutes</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#12131e] border border-slate-800 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Subscribers Breakdown</span>
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold text-white flex items-center justify-between">
                <span>Free: {metrics?.freeUsers || 0}</span>
                <span className="text-purple-400">Pro: {metrics?.proUsers || 0}</span>
              </div>
              <div className="text-xs text-indigo-300 font-semibold">
                Premium: {metrics?.premiumUsers || 0} studio teams
              </div>
            </div>
          </div>

          {/* Visual SVG Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Monthly User Growth</h3>
                  <p className="text-xs text-slate-400">Live platform registrations by month</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">6 Months Trend</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { m: 'Oct', v: 5200 },
                  { m: 'Nov', v: 7400 },
                  { m: 'Dec', v: 9800 },
                  { m: 'Jan', v: 11400 },
                  { m: 'Feb', v: 13200 },
                  { m: 'Mar', v: 14820 },
                ].map((item) => {
                  const heightPercent = Math.round((item.v / 16000) * 100);
                  return (
                    <div key={item.m} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-mono text-purple-300 font-bold">
                        {(item.v / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full bg-slate-900 rounded-t-xl overflow-hidden flex items-end h-28">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-lg transition-all duration-500"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{item.m}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">SaaS Revenue Growth ($)</h3>
                  <p className="text-xs text-slate-400">Monthly recurring subscription revenue</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">$64.2k MRR</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { m: 'Oct', v: 14200 },
                  { m: 'Nov', v: 21800 },
                  { m: 'Dec', v: 33400 },
                  { m: 'Jan', v: 42900 },
                  { m: 'Feb', v: 53100 },
                  { m: 'Mar', v: 64280 },
                ].map((item) => {
                  const heightPercent = Math.round((item.v / 70000) * 100);
                  return (
                    <div key={item.m} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-300 font-bold">
                        ${(item.v / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full bg-slate-900 rounded-t-xl overflow-hidden flex items-end h-28">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{item.m}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME UPDATES & LIVE EVENT STREAM */}
      {activeTab === 'live-feed' && (
        <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Event Stream Active</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">Real-time Platform Activity</h3>
              <p className="text-xs text-slate-400">Instant broadcasts of user signups, upgrades, and voice creations.</p>
            </div>

            <button
              onClick={loadLogsAndEvents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stream</span>
            </button>
          </div>

          <div className="space-y-3">
            {liveEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{evt.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{evt.message}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & SECURITY */}
      {activeTab === 'audit-logs' && (
        <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">System Audit Trail & Security</h3>
              <p className="text-xs text-slate-400">Super Admin action records, credit modifications, and login security.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/80">
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Actor Email</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="p-3.5 font-mono font-bold text-white">{log.action}</td>
                    <td className="p-3.5 text-purple-300">{log.adminEmail}</td>
                    <td className="p-3.5">{log.targetUserName || log.targetUserId || '-'}</td>
                    <td className="p-3.5 text-slate-300">{log.details}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VOICES MODERATION */}
      {activeTab === 'voices' && (
        <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Voice Catalog & Clones Governance</h3>
              <p className="text-xs text-slate-400">Publish, feature, or remove voices from public marketplace.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {adminVoices.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                      {v.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Language: {v.language} • {v.uses.toLocaleString()} generations
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdminVoices((prev) =>
                        prev.map((item) => (item.id === v.id ? { ...item, isPublic: !item.isPublic } : item))
                      );
                      success('Voice visibility updated');
                    }}
                    className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      v.isPublic
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        : 'bg-slate-800 text-slate-500 hover:text-white'
                    }`}
                    title={v.isPublic ? 'Public in Marketplace' : 'Private Voice'}
                  >
                    {v.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setAdminVoices((prev) => prev.filter((item) => item.id !== v.id));
                      success('Voice removed from catalog');
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Remove Voice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PROJECTS MODERATION */}
      {activeTab === 'projects' && (
        <div className="p-6 rounded-3xl bg-[#12131e] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Content Moderation & Project Audit</h3>
            <p className="text-xs text-slate-400">Review flagged projects, dubbing media, and dialogue scripts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-3 font-semibold">Project Title</th>
                  <th className="pb-3 font-semibold">Author</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Moderation Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {systemProjects.map((proj) => (
                  <tr key={proj.id} className="text-slate-300">
                    <td className="py-3 font-bold text-white">{proj.name}</td>
                    <td className="py-3">{proj.author}</td>
                    <td className="py-3 uppercase text-[11px] font-mono text-purple-400">{proj.type}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          proj.status === 'flagged'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSystemProjects((prev) => prev.filter((p) => p.id !== proj.id));
                          success('Project moderated and removed');
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete flagged project"
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
      )}

      {/* FULL USER DETAILS MODAL */}
      <AdminUserDetailsModal
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateUser={(updated) => {
          setDetailUser(updated);
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        }}
        onOpenAdjustCredits={(u) => {
          setCreditUser(u);
          setIsCreditModalOpen(true);
        }}
        onOpenChangePlan={(u) => {
          setPlanUser(u);
          setTargetTier(u.subscription);
          setIsPlanModalOpen(true);
        }}
        onToggleSuspend={(id) => handleToggleBan(id)}
        onDeleteUser={(id) => handleDeleteUser(id)}
      />

      {/* ADJUST CREDITS MODAL */}
      {isCreditModalOpen && creditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Adjust User Credits</h3>
            <p className="text-xs text-slate-400">
              Grant or deduct balance for <span className="text-purple-400 font-semibold">{creditUser.name}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Amount (+ to add, - to deduct)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reason / Note</label>
              <input
                type="text"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCreditsSubmit}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PLAN MODAL */}
      {isPlanModalOpen && planUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#12131e] border border-purple-500/30 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Change Subscription Plan</h3>
            <p className="text-xs text-slate-400">
              Modify tier for <span className="text-purple-400 font-semibold">{planUser.name}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Subscription Tier</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value as SubscriptionTier)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs capitalize"
              >
                <option value="free">Free ($0/mo - 15k chars)</option>
                <option value="creator">Creator ($15/mo - 50k chars)</option>
                <option value="pro">Pro ($29/mo - 100k chars)</option>
                <option value="premium">Premium ($79/mo - 500k chars)</option>
                <option value="business">Business ($199/mo - 1M chars)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlanSubmit}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
