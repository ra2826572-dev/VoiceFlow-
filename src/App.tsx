import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UsageProvider } from './context/UsageContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './views/LandingPage';
import { LoginView } from './views/LoginView';
import { Dashboard } from './views/Dashboard';
import { VoiceStudio } from './views/VoiceStudio';
import { VoiceToTextStudio } from './views/VoiceToTextStudio';
import { HistoryView } from './views/HistoryView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { PricingView } from './views/PricingView';
import { VoiceStudioView } from './views/VoiceStudioView';
import { WritingStudioView } from './views/WritingStudioView';
import { MultiLanguageStudioView } from './views/MultiLanguageStudioView';
import { VideoDubbingStudioView } from './views/VideoDubbingStudioView';
import { ProjectsView } from './views/ProjectsView';
import { AIAssistantView } from './views/AIAssistantView';
import { BillingView } from './views/BillingView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { MarketplaceView } from './views/MarketplaceView';
import { ApiPlatformView } from './views/ApiPlatformView';
import { HelpCenterView } from './views/HelpCenterView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { TeamWorkspaceModal } from './components/TeamWorkspaceModal';
import { ShareProjectModal } from './components/ShareProjectModal';
import { PublicAudioPlayerModal } from './components/PublicAudioPlayerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { ConversionItem } from './types';

// Sample initial conversions for rich interactive demonstration
const INITIAL_CONVERSIONS: ConversionItem[] = [
  {
    id: 'conv-1',
    type: 'text_to_speech',
    title: 'اردو خوش آمدید پیغام',
    text: 'وائس فلو اے آئی میں خوش آمدید۔ جدید مصنوعی ذہانت کے ساتھ اپنے الفاظ کو خوبصورت اور قدرتی آواز میں تبدیل کریں۔',
    voiceId: 'voice-ur-zara',
    voiceName: 'Zara Khan (Urdu)',
    language: 'ur',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    duration: 6.2,
    audioUrl: '',
    characterCount: 110,
  },
  {
    id: 'conv-2',
    type: 'text_to_speech',
    title: 'VoiceFlow Product Narration',
    text: 'VoiceFlow AI empowers developers, creators, and businesses to generate studio-grade vocal narrations effortlessly.',
    voiceId: 'voice-en-emma',
    voiceName: 'Emma Watson (English)',
    language: 'en',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    duration: 5.4,
    audioUrl: '',
    characterCount: 118,
  },
  {
    id: 'conv-3',
    type: 'voice_to_text',
    title: 'Voice Recording Transcription',
    text: 'Next-generation speech recognition delivers high accuracy punctuation and multi-dialect support.',
    language: 'en',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    duration: 4.8,
    characterCount: 94,
  },
];

// Helper to normalize any incoming conversion record into a consistent ConversionItem
const normalizeConversion = (item: any): ConversionItem => {
  const text = item?.text || item?.inputText || '';
  const title =
    item?.title ||
    (text ? text.substring(0, 40) + (text.length > 40 ? '...' : '') : 'Voice Recording');
  const type =
    item?.type === 'text-to-voice' || item?.type === 'text_to_speech'
      ? 'text_to_speech'
      : 'voice_to_text';

  return {
    id: item?.id || 'conv-' + Math.random().toString(36).substring(2, 9),
    type,
    title,
    text,
    voiceId: item?.voiceId || '',
    voiceName: item?.voiceName || '',
    language: item?.language || 'en',
    createdAt: item?.createdAt || new Date().toISOString(),
    duration: typeof item?.duration === 'number' ? item.duration : 4.0,
    audioUrl: item?.audioUrl || item?.outputAudioUrl || '',
    characterCount:
      typeof item?.characterCount === 'number' ? item.characterCount : text.length,
    settings: item?.settings,
  };
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { error: toastError } = useToast();

  const [currentView, setCurrentView] = useState<string>(() => {
    // When the link is opened in a new tab/session, require user to login first
    const isSessionLoggedIn =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('voiceflow_session_logged_in') === 'true';
    return isSessionLoggedIn ? 'dashboard' : 'login';
  });

  useEffect(() => {
    const isSessionLoggedIn =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('voiceflow_session_logged_in') === 'true';
    if (!isSessionLoggedIn && currentView !== 'login') {
      setCurrentView('login');
    }
  }, [isAuthenticated, currentView]);

  const [studioInitialText, setStudioInitialText] = useState<string | undefined>(undefined);
  const [canvasKey, setCanvasKey] = useState<number>(0);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [teamsModalOpen, setTeamsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);
  const [activeShareData, setActiveShareData] = useState<{ id: string; name: string }>({
    id: 'proj-1',
    name: 'Urdu Podcast Audio',
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K => Open AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAssistantModalOpen((prev) => !prev);
      }
      // Shift + ? => Open Shortcuts
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
      // Esc => Close modals
      if (e.key === 'Escape') {
        setAssistantModalOpen(false);
        setShortcutsModalOpen(false);
        setTeamsModalOpen(false);
        setShareModalOpen(false);
        setOnboardingOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleRemoteNavigate = () => {
      setCurrentView('billing');
    };
    window.addEventListener('navigate-to-billing', handleRemoteNavigate);
    return () => window.removeEventListener('navigate-to-billing', handleRemoteNavigate);
  }, []);

  const [conversions, setConversions] = useState<ConversionItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceflow_conversions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map(normalizeConversion);
          }
        } catch {}
      }
    }
    return INITIAL_CONVERSIONS.map(normalizeConversion);
  });

  // Fetch initial history from backend if available
  useEffect(() => {
    const fetchConversions = async () => {
      try {
        const res = await fetch('/api/conversions');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.conversions) && data.conversions.length > 0) {
            setConversions((prev) => {
              const safePrev = Array.isArray(prev) ? prev : [];
              const normalizedRemote = data.conversions.map(normalizeConversion);
              const ids = new Set(normalizedRemote.map((c: ConversionItem) => c.id));
              const combined = [
                ...normalizedRemote,
                ...safePrev.filter((p) => p && !ids.has(p.id)),
              ];
              try {
                localStorage.setItem('voiceflow_conversions', JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      } catch {
        // use local
      }
    };
    fetchConversions();
  }, []);

  const handleAddConversion = (item: ConversionItem) => {
    const normalized = normalizeConversion(item);
    setConversions((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = [normalized, ...safePrev];
      try {
        localStorage.setItem('voiceflow_conversions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteConversion = async (id: string) => {
    setConversions((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = safePrev.filter((item) => item && item.id !== id);
      try {
        localStorage.setItem('voiceflow_conversions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/conversions/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleClearAllHistory = () => {
    setConversions([]);
    localStorage.removeItem('voiceflow_conversions');
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleNewCanvas = () => {
    setStudioInitialText('');
    setCanvasKey((prev) => prev + 1);
    setCurrentView('studio');
  };

  const handleNavigate = (view: string) => {
    const protectedViews = [
      'dashboard',
      'studio',
      'voice-studio',
      'writing-studio',
      'multi-language',
      'video-dubbing',
      'projects',
      'voice-to-text',
      'history',
      'favorites',
      'profile',
      'settings',
      'pricing',
      'billing',
      'help',
      'help-center',
      'ai-assistant',
      'marketplace',
      'api-platform',
      'admin',
    ];
    if (protectedViews.includes(view) && !isAuthenticated) {
      setCurrentView('login');
      return;
    }

    if (view === 'admin') {
      const isAuthorizedAdmin = isAdmin || user?.email === 'ra2826572@gmail.com' || sessionStorage.getItem('vf_admin_unlocked') === 'true';
      if (!isAuthorizedAdmin) {
        toastError('Access Denied: Administrator role required. Normal users cannot access Admin Console.');
        return;
      }
      const isUnlocked = sessionStorage.getItem('vf_admin_unlocked') === 'true';
      if (!isUnlocked) {
        setAdminPasswordModalOpen(true);
        return;
      }
    }

    if (view === 'studio') {
      setStudioInitialText(undefined);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenAssistant={() => setAssistantModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        onOpenTeams={() => setTeamsModalOpen(true)}
      />

      {/* Main View Router */}
      {!isAuthenticated || currentView === 'login' ? (
        <main className="flex-1 overflow-y-auto bg-[#090a0f] min-w-0">
          <LoginView onNavigate={handleNavigate} />
        </main>
      ) : currentView === 'landing' ? (
        <main className="flex-1 overflow-y-auto">
          <LandingPage
            onGetStarted={() => {
              if (isAuthenticated) {
                setCurrentView('dashboard');
              } else {
                handleOpenAuth('signup');
              }
            }}
            onExploreStudio={() => setCurrentView('dashboard')}
          />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Workspace Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            className="hidden md:flex"
          />

          {/* Workspace Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-[#090a0f] min-w-0">
            {currentView === 'dashboard' && (
              <Dashboard
                onNavigate={handleNavigate}
                conversions={conversions}
                onDeleteConversion={handleDeleteConversion}
                onNewCanvas={handleNewCanvas}
              />
            )}

            {currentView === 'studio' && (
              <VoiceStudio
                key={canvasKey}
                initialText={studioInitialText}
                onNavigateToHistory={() => setCurrentView('history')}
                recentConversions={conversions}
                onAddConversion={handleAddConversion}
                onDeleteConversion={handleDeleteConversion}
              />
            )}

            {currentView === 'voice-studio' && (
              <VoiceStudioView
                onSendToEditor={(text: string) => {
                  setStudioInitialText(text);
                  setCurrentView('studio');
                }}
              />
            )}

            {currentView === 'writing-studio' && (
              <WritingStudioView
                onSendToVoiceStudio={(text) => {
                  setStudioInitialText(text);
                  setCurrentView('studio');
                }}
              />
            )}

            {currentView === 'multi-language' && <MultiLanguageStudioView />}

            {currentView === 'projects' && (
              <ProjectsView
                onOpenProject={(proj) => {
                  if (proj.type === 'script') setCurrentView('writing-studio');
                  else setCurrentView('studio');
                }}
              />
            )}

            {currentView === 'voice-to-text' && (
              <VoiceToTextStudio onAddConversion={handleAddConversion} />
            )}

            {(currentView === 'history' || currentView === 'favorites') && (
              <HistoryView
                conversions={conversions}
                onDeleteConversion={handleDeleteConversion}
                onClearAll={handleClearAllHistory}
              />
            )}

            {(currentView === 'profile' || currentView === 'settings') && (
              <ProfileSettingsView
                onNavigateToPricing={() => setCurrentView('billing')}
              />
            )}

            {(currentView === 'pricing' || currentView === 'billing') && (
              <BillingView />
            )}

            {currentView === 'ai-assistant' && (
              <AIAssistantView
                onNavigateToVoiceStudio={(script) => {
                  setStudioInitialText(script);
                  setCurrentView('studio');
                }}
              />
            )}

            {currentView === 'marketplace' && (
              <MarketplaceView
                onUseVoiceInStudio={(voiceId) => {
                  setCurrentView('studio');
                }}
              />
            )}

            {currentView === 'api-platform' && <ApiPlatformView />}

            {currentView === 'admin' && (
              (isAdmin || user?.email === 'ra2826572@gmail.com' || sessionStorage.getItem('vf_admin_unlocked') === 'true') ? (
                <AdminDashboardView onLock={() => setCurrentView('dashboard')} />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
                  <p>You do not have permission to view the Administrator Console.</p>
                </div>
              )
            )}

            {(currentView === 'help' || currentView === 'help-center') && (
              <HelpCenterView />
            )}
          </main>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setCurrentView('dashboard');
          setOnboardingOpen(true);
        }}
      />

      {/* AI Assistant Floating Context Modal (Cmd+K) */}
      <AIAssistantModal
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
        currentScript={studioInitialText}
        onApplyToCurrentScript={(updated) => {
          setStudioInitialText(updated);
          setCanvasKey((prev) => prev + 1);
        }}
      />

      {/* Keyboard Shortcuts Guide */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Team Workspace Collaborators */}
      <TeamWorkspaceModal
        isOpen={teamsModalOpen}
        onClose={() => setTeamsModalOpen(false)}
      />

      {/* Share Project Modal */}
      <ShareProjectModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        projectName={activeShareData.name}
        projectId={activeShareData.id}
      />

      {/* New User Onboarding Flow */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(pData) => {
          setStudioInitialText(pData.script);
          setCurrentView('studio');
        }}
      />

      {/* Admin Password Gate Modal */}
      <AdminPasswordModal
        isOpen={adminPasswordModalOpen}
        onClose={() => setAdminPasswordModalOpen(false)}
        onSuccess={() => {
          setCurrentView('admin');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UsageProvider>
            <MainAppContent />
          </UsageProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
