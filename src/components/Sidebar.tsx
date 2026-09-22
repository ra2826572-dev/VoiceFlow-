import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Mic,
  History,
  Heart,
  CreditCard,
  Settings,
} from 'lucide-react';

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
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'studio',
      label: 'Text to Voice',
      icon: Radio,
      badge: 'TTS',
    },
    {
      id: 'voice-to-text',
      label: 'Voice to Text',
      icon: Mic,
      badge: 'STT',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      badge: null,
    },
    {
      id: 'pricing',
      label: 'Subscription',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      id="workspace-sidebar"
      className={`w-60 shrink-0 bg-[#0c0d14] border-r border-slate-800/80 flex flex-col justify-between py-6 px-3.5 select-none transition-all ${className}`}
    >
      <div className="space-y-6">
        {/* Workspace Category Header */}
        <div className="px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            WORKSPACE
          </p>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1.5" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'studio' && currentView === 'text-to-voice') ||
              (item.id === 'pricing' && currentView === 'subscription') ||
              (item.id === 'settings' && currentView === 'profile');

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#7c3aed] text-white font-semibold shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800/90 text-slate-400 group-hover:text-slate-300 border border-slate-700/50'
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

      {/* Footer Info / Version tag */}
      <div className="px-3 pt-6 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>VoiceFlow AI</span>
        <span className="font-mono text-purple-400">v2.4</span>
      </div>
    </aside>
  );
};
