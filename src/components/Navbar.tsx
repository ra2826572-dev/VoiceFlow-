import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from './NotificationCenter';
import {
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Mic,
  Headphones,
  History,
  Bot,
  Keyboard,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenAssistant?: () => void;
  onOpenShortcuts?: () => void;
  onOpenTeams?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAssistant,
  onOpenShortcuts,
  onOpenTeams,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo
          size="md"
          showTagline={true}
          onClick={() => handleNavClick(isAuthenticated ? 'dashboard' : 'landing')}
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {!isAuthenticated ? (
            <>
              <button
                id="nav-link-landing"
                onClick={() => handleNavClick('landing')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'landing'
                    ? 'text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Product
              </button>
              <button
                id="nav-link-features"
                onClick={() => handleNavClick('landing')}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                id="nav-link-pricing"
                onClick={() => handleNavClick('pricing')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'pricing'
                    ? 'text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pricing
              </button>
              <button
                id="nav-link-how-it-works"
                onClick={() => handleNavClick('landing')}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-link-dashboard"
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-link-studio"
                onClick={() => handleNavClick('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'studio'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Text → Voice</span>
              </button>

              <button
                id="nav-link-v2t"
                onClick={() => handleNavClick('voice-to-text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'voice-to-text'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Voice → Text</span>
              </button>

              <button
                id="nav-link-history"
                onClick={() => handleNavClick('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'history'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Section: Theme Toggle + Auth / Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {isAuthenticated && (
            <>
              {/* Keyboard Shortcuts Trigger */}
              <button
                onClick={onOpenShortcuts}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Keyboard Shortcuts (Shift + ?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Team Workspace Trigger */}
              <button
                onClick={onOpenTeams}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Team Workspace"
              >
                <Users className="w-4 h-4" />
              </button>

              {/* Notification Center */}
              <NotificationCenter onNavigate={onNavigate} />

              {/* Quick AI Assistant Trigger */}
              <button
                onClick={onOpenAssistant}
                className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Open Studio AI Assistant"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden md:inline">AI Assistant</span>
              </button>
            </>
          )}

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-signin"
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>

              <button
                id="btn-nav-getstarted"
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-600 shadow-sm shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Free
              </button>
            </div>
          ) : (
            /* User Avatar & Dropdown */
            <div className="relative">
              <button
                id="user-profile-menu-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 bg-slate-50 dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <UserAvatar size="sm" />
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold font-mono max-w-[120px] truncate">
                    @{user?.username?.replace(/^@/, '') || 'user'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <UserDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('studio')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Text → Voice Studio
              </button>
              <button
                onClick={() => handleNavClick('voice-to-text')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Voice → Text Studio
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Conversion History
              </button>
              <button
                onClick={() => handleNavClick('profile')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profile & Settings
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('landing')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Home / Product
              </button>
              <button
                onClick={() => handleNavClick('pricing')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Pricing
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold"
                >
                  Get Started Free
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
