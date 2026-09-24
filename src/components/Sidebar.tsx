import React, { useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  Mic,
  PenTool,
  Globe,
  FolderKanban,
  CreditCard,
  Settings,
  Sparkles,
  ChevronRight,
  Bot,
  Store,
  Code2,
  HelpCircle,
  ShieldAlert,
  LogOut,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUsage } from '../context/UsageContext';
import { AdminPasswordModal } from './AdminPasswordModal';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  className = '',
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { usage } = useUsage();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const sections = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'projects', label: 'Projects & Folders', icon: FolderKanban, badge: 'Pro' },
        { id: 'ai-assistant', label: 'AI Studio Assistant', icon: Bot, badge: 'AI' },
      ],
    },
    {
      title: 'AI VOICE & AUDIO',
      items: [
        { id: 'voice-studio', label: 'AI Voice Studio', icon: Radio, badge: 'Clone' },
        { id: 'voice-to-text', label: 'Voice to Text', icon: Mic, badge: 'STT' },
      ],
    },
    {
      title: 'CONTENT & MEDIA',
      items: [
        { id: 'writing-studio', label: 'AI Writing Studio', icon: PenTool, badge: '12 Tools' },
        { id: 'multi-language', label: 'Multi-Language AI', icon: Globe, badge: '15+' },
      ],
    },
    {
      title: 'PLATFORM & ECOSYSTEM',
      items: [
        { id: 'marketplace', label: 'Voice Marketplace', icon: Store, badge: 'Explore' },
        { id: 'api-platform', label: 'Developer API', icon: Code2, badge: 'v1' },
      ],
    },
    {
      title: 'ACCOUNT & BILLING',
      items: [
        { id: 'billing', label: 'Billing & Credits', icon: CreditCard, badge: null },
        { id: 'help-center', label: 'Help Center & FAQ', icon: HelpCircle, badge: null },
        { id: 'settings', label: 'Account & Settings', icon: Settings, badge: null },
        { id: 'admin', label: 'Admin Console', icon: ShieldAlert, badge: 'Protected' },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    // If Admin Console is clicked, verify admin password '591111'
    if (id === 'admin') {
      const isUnlocked = sessionStorage.getItem('vf_admin_unlocked') === 'true';
      if (!isUnlocked) {
        setIsAdminModalOpen(true);
        return;
      }
    }

    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleAdminSuccess = () => {
    onNavigate('admin');
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      id="workspace-sidebar"
      className={`w-64 shrink-0 bg-[#0c0d14] border-r border-slate-800/80 flex flex-col justify-between py-5 px-3 select-none transition-all overflow-y-auto ${className}`}
    >
      <div className="space-y-5">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sec.title}
              </p>
            </div>

            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentView === item.id ||
                  (item.id === 'voice-studio' && (currentView === 'studio' || currentView === 'text-to-voice')) ||
                  (item.id === 'settings' && currentView === 'profile') ||
                  (item.id === 'billing' && currentView === 'pricing');

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge === 'New' || item.badge === 'Explore'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.badge === 'Root'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Usage & Status Card */}
      <div className="pt-4 px-2 space-y-3">
        {/* Resource Usage Preview */}
        {!usage?.isUnlimitedAdmin && (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voice Usage</span>
              <span className="text-[10px] font-black text-slate-300">
                {usage?.features.TEXT_TO_VOICE.used}/{usage?.features.TEXT_TO_VOICE.limit}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-purple-600 h-full transition-all duration-500" 
                style={{ width: `${usage?.features.TEXT_TO_VOICE.percentage || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Writing</span>
              <span className="text-[10px] font-black text-slate-300">
                {usage?.features.AI_WRITING.used}/{usage?.features.AI_WRITING.limit}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500" 
                style={{ width: `${usage?.features.AI_WRITING.percentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {usage?.isUnlimitedAdmin && (
          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Unlimited Admin Access</span>
          </div>
        )}

        {/* Upgrade Card */}
        {usage?.plan !== 'pro' && !usage?.isUnlimitedAdmin && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2 text-left">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
              <Crown className="w-3.5 h-3.5 text-indigo-400" />
              <span>VoiceFlow Free Tier</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Upgrade to Pro for higher limits, premium voices & priority rendering.
            </p>
            <button
              onClick={() => onNavigate('billing')}
              className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Upgrade to Pro</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {usage?.plan === 'pro' && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-2 text-left text-emerald-300">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pro Member</span>
            </div>
            <p className="text-[10px] text-emerald-400/70 leading-tight">
              Enjoy high-volume limits and elite AI production tools.
            </p>
          </div>
        )}
      </div>

      {/* Logged in User Information */}
      {user && (
        <div className="pt-3 px-2">
          <div className="p-2.5 rounded-xl bg-[#11121a] border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-purple-400 font-mono font-semibold truncate leading-tight">
                  @{user.username?.replace(/^@/, '') || 'user'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('login');
              }}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Password Verification Modal */}
      <AdminPasswordModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </aside>
  );
};
