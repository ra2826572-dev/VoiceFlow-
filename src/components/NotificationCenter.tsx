import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Volume2,
  Video,
  Mic,
  CreditCard,
  Info,
  CheckCheck,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  onNavigate?: (view: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n-1',
      title: 'Audio Generation Ready',
      message: 'Your Urdu historical narration "Dastan-e-Urdu" has finished rendering.',
      type: 'audio',
      read: false,
      timestamp: '10m ago',
      linkView: 'history',
    },
    {
      id: 'n-2',
      title: 'AI Video Dubbing Complete',
      message: 'Video dubbing into English with subtitle sync is ready for download.',
      type: 'video',
      read: false,
      timestamp: '1h ago',
      linkView: 'dubbing',
    },
    {
      id: 'n-3',
      title: 'Voice Clone Model Ready',
      message: 'Your custom voice sample "Hamza Voice" is verified and available in studio.',
      type: 'clone',
      read: true,
      timestamp: '3h ago',
      linkView: 'voice-clone',
    },
    {
      id: 'n-4',
      title: 'Pro Plan Active',
      message: '100,000 monthly character credits added to your account.',
      type: 'billing',
      read: true,
      timestamp: '1d ago',
      linkView: 'billing',
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'audio':
        return <Volume2 className="w-4 h-4 text-purple-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'clone':
        return <Mic className="w-4 h-4 text-emerald-400" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#12131e] border border-purple-500/30 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-1 text-slate-500 hover:text-slate-300"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.linkView && onNavigate) {
                      onNavigate(n.linkView);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-4 hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer ${
                    !n.read ? 'bg-purple-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
