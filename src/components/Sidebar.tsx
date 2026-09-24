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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
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

      {/* Pro Badge Card */}
      <div className="pt-4 px-2">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>VoiceFlow Studio Pro</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Unlimited AI voice cloning, multi-speaker mixing & studio audio.
          </p>
          <button
            onClick={() => onNavigate('billing')}
            className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Upgrade Tier</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Admin Password Verification Modal */}
      <AdminPasswordModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </aside>
  );
};
