import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { VoiceStudio } from './views/VoiceStudio';
import { VoiceToTextStudio } from './views/VoiceToTextStudio';
import { HistoryView } from './views/HistoryView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { PricingView } from './views/PricingView';
import { ConversionItem } from './types';
import { VOICES_CATALOG } from './data/voices';

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
  const { isAuthenticated } = useAuth();

  const [currentView, setCurrentView] = useState<string>(() => {
    return 'dashboard';
  });

  const [studioInitialText, setStudioInitialText] = useState<string | undefined>(undefined);
  const [canvasKey, setCanvasKey] = useState<number>(0);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

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
      />

      {/* Main View Router */}
      {currentView === 'landing' ? (
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
          {/* Workspace Left Sidebar (matching design) */}
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
                onNavigateToPricing={() => setCurrentView('pricing')}
              />
            )}

            {currentView === 'pricing' && (
              <PricingView onUpgradeSuccess={() => setCurrentView('studio')} />
            )}

            {currentView === 'help' && (
              <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-center">
                <h1 className="text-3xl font-black text-white">
                  Help & Support
                </h1>
                <p className="text-slate-400 text-sm">
                  Need assistance with VoiceFlow AI studio, custom voice models, or billing inquiries?
                </p>
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#12131a] text-left space-y-3">
                  <h4 className="font-bold text-sm text-white">Frequently Asked Questions</h4>
                  <p className="text-xs text-slate-300">
                    <strong>Q: How do I change my profile avatar?</strong><br />
                    A: Click your avatar at the top right of the navbar → Select "Profile" → Upload any photo or switch to Initials mode ("RA").
                  </p>
                  <p className="text-xs text-slate-300">
                    <strong>Q: Which audio formats can I download?</strong><br />
                    A: Both lossless WAV and high-quality MP3 are available directly in the audio player.
                  </p>
                  <p className="text-xs text-slate-300">
                    <strong>Q: Does VoiceFlow AI support Urdu and RTL languages?</strong><br />
                    A: Yes! The editor features bidirectional RTL text support and custom neural voices for Urdu, Arabic, and Roman Urdu.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer hover:bg-purple-500"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setCurrentView('dashboard')}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
