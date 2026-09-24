import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Share2,
  FileText,
  Layers,
  Award,
  Video,
  Building,
  History,
  Lightbulb,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Download,
  FolderPlus,
  Trash2,
  MessageSquare,
  ArrowRight,
  Zap,
  Globe,
  Smile,
  Clock,
  Target,
  FileCheck,
  Send,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUsage } from '../context/UsageContext';
import { useAuth } from '../context/AuthContext';
import {
  ScriptCategory,
  ScriptToolType,
  BrandVoiceProfile,
  WritingDocument,
} from '../types';
import { WritingSmartEditor } from '../components/writing/WritingSmartEditor';
import { ContentRepurposerModal } from '../components/writing/ContentRepurposerModal';
import { ScriptBuilderTimeline } from '../components/writing/ScriptBuilderTimeline';
import { ContentQualityModal } from '../components/writing/ContentQualityModal';
import { BrandVoiceModal } from '../components/writing/BrandVoiceModal';
import { WritingVideoWorkflowModal } from '../components/writing/WritingVideoWorkflowModal';

interface WritingStudioViewProps {
  onSendToVoiceStudio?: (text: string) => void;
}

interface ToolDefinition {
  id: ScriptToolType;
  name: string;
  desc: string;
  category: ScriptCategory;
  icon: string;
  exampleTopic: string;
}

const TOOLS: ToolDefinition[] = [
  // Social Media
  { id: 'youtube', name: 'YouTube Long Script', desc: 'Hook-driven structured video scripts with timestamps', category: 'social', icon: '▶️', exampleTopic: 'The Future of AI Voice Cloning in 2026' },
  { id: 'youtube_shorts', name: 'YouTube Shorts', desc: 'Fast 45-second high-retention vertical script', category: 'social', icon: '📱', exampleTopic: 'Why 90% of Creators Fail on YouTube' },
  { id: 'tiktok', name: 'TikTok Viral Script', desc: 'Disruptive 3-second visual hook & punchy flow', category: 'social', icon: '🎵', exampleTopic: 'Secret productivity hack nobody tells you' },
  { id: 'reel', name: 'Instagram Reel', desc: 'Relatable pacing with seamless loop transitions', category: 'social', icon: '📸', exampleTopic: 'How I save 20 hours a week with automation' },
  { id: 'linkedin_post', name: 'LinkedIn Thought Leadership', desc: 'High-engagement text with 1-line curiosity hooks', category: 'social', icon: '💼', exampleTopic: 'What building a SaaS taught me about founder burnout' },
  { id: 'twitter_thread', name: 'X / Twitter Thread', desc: '5-tweet viral breakdown with strong retention hook', category: 'social', icon: '🧵', exampleTopic: '10 AI tools that save 10 hours of manual work' },
  { id: 'twitter_post', name: 'Viral X Post', desc: 'Punchy single tweet under 280 characters', category: 'social', icon: '🐦', exampleTopic: 'Consistency beats raw talent every single time.' },
  { id: 'instagram_caption', name: 'Instagram Captions', desc: '3 aesthetic caption options with emojis & hashtags', category: 'social', icon: '✨', exampleTopic: 'Behind the scenes at our product launch' },
  { id: 'carousel_content', name: 'Carousel Slides Copy', desc: '6-slide outline for LinkedIn & Instagram', category: 'social', icon: '📑', exampleTopic: 'Step-by-step roadmap to master copywriting' },
  { id: 'facebook_post', name: 'Facebook Community Post', desc: 'Story-driven post designed for shares and comments', category: 'social', icon: '👥', exampleTopic: 'A personal lesson from my early career mistakes' },

  // Marketing
  { id: 'ad', name: 'PAS Commercial Ad', desc: 'Problem-Agitate-Solve direct response copy', category: 'marketing', icon: '📣', exampleTopic: 'High-converting ad for VoiceFlow AI Studio' },
  { id: 'landing_page_copy', name: 'Landing Page Hero Copy', desc: 'Hero headline, value pillars & primary CTA', category: 'marketing', icon: '🚀', exampleTopic: 'AI Audio Studio for Podcasters and Creators' },
  { id: 'sales_copy', name: 'Sales Copy & Pitch', desc: 'Persuasive conversion-focused product pitch', category: 'marketing', icon: '💰', exampleTopic: 'Premium noise-cancelling wireless headphones' },
  { id: 'marketing_email', name: 'Marketing Promo Email', desc: 'Catchy subject line, urgency body & CTA button', category: 'marketing', icon: '📧', exampleTopic: '48-hour flash sale on all creator plans' },
  { id: 'newsletter', name: 'Email Newsletter', desc: 'Weekly curated breakdown with personal story', category: 'marketing', icon: '📰', exampleTopic: 'The 3 inflection points in creator economy this year' },
  { id: 'product_description', name: 'eCommerce Description', desc: 'Sensory benefits, specs & emotional hooks', category: 'marketing', icon: '🛍️', exampleTopic: 'Minimalist leather everyday carry backpack' },
  { id: 'cta_generator', name: 'Call-to-Action Generator', desc: '10 magnetic CTAs categorized by urgency & curiosity', category: 'marketing', icon: '⚡', exampleTopic: 'Start creating free voiceovers now' },
  { id: 'ad_headlines', name: 'A/B Ad Headlines', desc: '10 high-CTR headlines for Google and Meta Ads', category: 'marketing', icon: '🎯', exampleTopic: 'Enterprise Voice Cloning Platform' },
  { id: 'google_ads', name: 'Google Search Ads', desc: '5 Headlines (<30 chars) and 3 Descriptions (<90 chars)', category: 'marketing', icon: '🔍', exampleTopic: 'Best text to speech software for video editors' },

  // Business
  { id: 'business_proposal', name: 'Business Proposal', desc: 'Scope, objectives, timeline, ROI & deliverables', category: 'business', icon: '📊', exampleTopic: 'AI Translation Integration for E-Learning Platform' },
  { id: 'executive_summary', name: 'Executive Summary', desc: 'C-suite summary of core strategy & financial impact', category: 'business', icon: '👔', exampleTopic: 'Q3 Enterprise Audio Expansion Strategy' },
  { id: 'company_profile', name: 'Company Profile', desc: 'Mission, core capabilities & client value proposition', category: 'business', icon: '🏢', exampleTopic: 'VoiceFlow AI Technologies' },
  { id: 'project_proposal', name: 'Project Scope Document', desc: 'Technical milestones, dependencies & KPIs', category: 'business', icon: '📋', exampleTopic: 'Cloud infrastructure migration roadmap' },
  { id: 'meeting_summary', name: 'Meeting Notes to Summary', desc: 'Decisions made, discussion points & action items', category: 'business', icon: '📝', exampleTopic: 'Weekly product roadmap sync with engineering' },
  { id: 'professional_email', name: 'Professional Business Email', desc: 'Crisp, polite corporate communication', category: 'business', icon: '✉️', exampleTopic: 'Partnership inquiry with audio production studio' },
  { id: 'client_message', name: 'Client Status Update', desc: 'Clear milestone progress and next steps', category: 'business', icon: '💬', exampleTopic: 'Milestone 2 deliverable ready for client review' },
  { id: 'follow_up_email', name: 'High-Reply Follow Up', desc: 'Polite, non-pushy follow-up after a demo', category: 'business', icon: '🔔', exampleTopic: 'Follow up on enterprise pricing proposal' },

  // Creative
  { id: 'story', name: 'Atmospheric Story', desc: 'Sensory storytelling with dynamic tension & pacing', category: 'creative', icon: '📖', exampleTopic: 'A radio operator discovering an unexpected signal' },
  { id: 'short_story', name: 'Short Story with Twist', desc: 'Rich character narrative with unexpected ending', category: 'creative', icon: '🎭', exampleTopic: 'The antique watchmaker who could pause 10 seconds' },
  { id: 'voiceover_script', name: 'Broadcast Voiceover Script', desc: 'Natural breath pauses and vocal cues included', category: 'creative', icon: '🎙️', exampleTopic: 'Luxury electric sports car launch narration' },
  { id: 'podcast', name: 'Podcast Segment Script', desc: 'Conversational banter, questions & deep dive transitions', category: 'creative', icon: '🎧', exampleTopic: 'Interview with a film sound designer' },
  { id: 'movie_script', name: 'Cinematic Movie Scene', desc: 'Standard screenplay dialogue and scene headings', category: 'creative', icon: '🎬', exampleTopic: 'Two detectives solving a high-tech heist in 2040' },
  { id: 'character_description', name: 'Character Profile', desc: 'Physical traits, psychology, voice cadence & flaws', category: 'creative', icon: '👤', exampleTopic: 'A rogue cybernetic architect from Neo-Tokyo' },
  { id: 'song_lyrics', name: 'Complete Song Lyrics', desc: 'Verse, Pre-Chorus, Chorus, Bridge, and Outro', category: 'creative', icon: '🎶', exampleTopic: 'An upbeat synthwave anthem about late night drives' },
  { id: 'poetry', name: 'Evocative Poetry', desc: 'Expressive rhythm and metaphoric depth', category: 'creative', icon: '📜', exampleTopic: 'The quiet stillness before a summer rain' },

  // Education
  { id: 'essay', name: 'Academic Essay Draft', desc: 'Thesis statement, evidence paragraphs & conclusion', category: 'education', icon: '🎓', exampleTopic: 'The Socioeconomic Impact of Neural Networks' },
  { id: 'explanation', name: 'Simple Explanation (Feynman)', desc: 'Complex topic broken down with everyday analogies', category: 'education', icon: '💡', exampleTopic: 'How quantum computing actually works' },
  { id: 'study_notes', name: 'Revision Study Notes', desc: 'Key definitions, mnemonics & review bullets', category: 'education', icon: '📚', exampleTopic: 'Key principles of organic chemistry thermodynamics' },
  { id: 'quiz', name: '5-Question Multiple Choice Quiz', desc: 'Questions with answer keys and explanations', category: 'education', icon: '❓', exampleTopic: 'World History: The Industrial Revolution' },
  { id: 'flashcards', name: '8 Flashcard Pairs', desc: 'Front/Back terminology cards for rapid recall', category: 'education', icon: '🃏', exampleTopic: 'Key Italian musical terminology' },
  { id: 'lesson_plan', name: '45-Min Lesson Plan', desc: 'Objectives, warm-up, core activity & assessment', category: 'education', icon: '🍎', exampleTopic: 'Introduction to Creative Writing & Metaphors' },
];

export const WritingStudioView: React.FC<WritingStudioViewProps> = ({ onSendToVoiceStudio }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { checkLimit, showLimitModal, refreshUsage } = useUsage();

  // Navigation / Workspace View Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'editor' | 'timeline' | 'ideas' | 'documents' | 'chat'>('home');
  const [selectedCategory, setSelectedCategory] = useState<ScriptCategory | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition>(TOOLS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Input States
  const [topic, setTopic] = useState<string>('');
  const [currentText, setCurrentText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedTone, setSelectedTone] = useState<string>('Professional & Confident');
  const [selectedLength, setSelectedLength] = useState<string>('Medium (1-2 min)');
  const [targetAudience, setTargetAudience] = useState<string>('General Creators & Business');

  // Advanced Controls
  const [isSeoMode, setIsSeoMode] = useState<boolean>(false);
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [brandVoices, setBrandVoices] = useState<BrandVoiceProfile[]>([]);
  const [activeBrandVoiceId, setActiveBrandVoiceId] = useState<string | null>(null);

  // Documents & Versions
  const [documents, setDocuments] = useState<WritingDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState<string>('Untitled AI Script');

  // AI Assistant Chat Mode
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! I am your AI Writing Co-Pilot. Describe what you need, ask for ideas, or tell me to write or rephrase anything.' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Ideas Generator States
  const [ideasPack, setIdeasPack] = useState<{ videoIdeas: string[]; hooks: string[]; titles: string[]; captions: string[]; ctas: string[] } | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);

  // Generation Loading State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modal States
  const [showRepurposerModal, setShowRepurposerModal] = useState<boolean>(false);
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [showBrandVoiceModal, setShowBrandVoiceModal] = useState<boolean>(false);
  const [showVideoWorkflowModal, setShowVideoWorkflowModal] = useState<boolean>(false);

  // Load brand voices and saved documents on mount
  useEffect(() => {
    fetchBrandVoices();
    fetchDocuments();
  }, []);

  const fetchBrandVoices = async () => {
    try {
      const res = await fetch('/api/ai/brand-voices');
      if (res.ok) {
        const data = await res.json();
        setBrandVoices(data.brandVoices || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/ai/writing/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      // ignore
    }
  };

  // Main Generation Handler
  const handleGenerate = async (overrideAction?: string, overrideTopic?: string) => {
    const topicToUse = overrideTopic || topic;
    if (!topicToUse.trim() && !currentText.trim()) {
      error('Please enter a topic or some starting notes');
      return;
    }

    if (!checkLimit('AI_WRITING')) {
      showLimitModal('AI_WRITING');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          toolType: selectedTool.id,
          topic: topicToUse,
          currentText,
          language: selectedLanguage,
          tone: selectedTone,
          length: selectedLength,
          audience: targetAudience,
          action: overrideAction || 'generate',
          brandVoiceId: activeBrandVoiceId,
          seoKeywords: isSeoMode ? seoKeywords : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentText(data.text);
        setActiveTab('editor');
        success(`Generated ${selectedTool.name} successfully!`);
        refreshUsage();
      } else {
        if (res.status === 403) {
          const data = await res.json();
          if (data.code === 'LIMIT_REACHED') {
            showLimitModal('AI_WRITING');
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('Generation failed');
      }
    } catch {
      error('Failed to generate content with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Rewrite / Quick Actions on editor
  const handleAiAction = async (action: string, customText?: string) => {
    if (!checkLimit('AI_WRITING')) {
      showLimitModal('AI_WRITING');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          toolType: selectedTool.id,
          topic: '',
          currentText: customText || currentText,
          language: selectedLanguage,
          tone: selectedTone,
          action,
          brandVoiceId: activeBrandVoiceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (customText) {
          // Replace selected substring in currentText
          setCurrentText((prev) => prev.replace(customText, data.text));
        } else {
          setCurrentText(data.text);
        }
        success(`Applied AI action: ${action}`);
        refreshUsage();
      } else {
        if (res.status === 403) {
          const data = await res.json();
          if (data.code === 'LIMIT_REACHED') {
            showLimitModal('AI_WRITING');
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('AI action failed');
      }
    } catch {
      error(`Could not execute AI action: ${action}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Translation handler
  const handleTranslate = async (targetLang: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, targetLanguage: targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentText(data.translatedText);
        setSelectedLanguage(targetLang);
        success(`Translated to ${targetLang}!`);
      }
    } catch {
      error('Translation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Ideas generator
  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || 'AI Tools for Modern Creators', language: selectedLanguage }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdeasPack(data);
        setActiveTab('ideas');
        success('Generated viral ideas and hook bundle!');
      }
    } catch {
      error('Could not generate ideas');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Chat message handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userMsg,
          currentText,
          toolType: 'story',
          tone: selectedTone,
          language: selectedLanguage,
          customInstructions: 'You are an interactive writing assistant. Answer questions or draft requested copy concisely.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I encountered an issue. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Save document to backend
  const handleSaveDocument = async () => {
    if (!currentText.trim()) {
      error('No content to save');
      return;
    }

    try {
      const titleToSave = docTitle || `${selectedTool.name} - ${new Date().toLocaleDateString()}`;
      if (activeDocumentId) {
        const res = await fetch(`/api/ai/writing/documents/${activeDocumentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleToSave, content: currentText }),
        });
        if (res.ok) {
          success('Document updated with new version!');
          fetchDocuments();
        }
      } else {
        const res = await fetch('/api/ai/writing/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleToSave,
            content: currentText,
            category: selectedTool.category,
            toolType: selectedTool.id,
            tone: selectedTone,
            language: selectedLanguage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setActiveDocumentId(data.document.id);
          success('Document saved to your workspace!');
          fetchDocuments();
        }
      }
    } catch {
      error('Failed to save document');
    }
  };

  // Export handlers
  const handleExportText = (format: 'txt' | 'md') => {
    if (!currentText.trim()) return;
    const filename = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    success(`Exported as .${format}!`);
  };

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0b10] text-slate-100 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#0d0e17] border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>AI Writing Studio Pro</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Gemini 3.8 Flash • 45+ Templates
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Enterprise multi-channel copywriting, neural scripts & AI repurposing workspace.
            </p>
          </div>
        </div>

        {/* Global Workspace Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRepurposerModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Repurpose (1 → 9)</span>
          </button>

          <button
            onClick={() => setShowQualityModal(true)}
            disabled={!currentText.trim()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Quality Audit</span>
          </button>

          <button
            onClick={() => setShowBrandVoiceModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Brand Voice</span>
          </button>

          <button
            onClick={() => setShowVideoWorkflowModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-pink-400" />
            <span>Video Pipeline</span>
          </button>

          {onSendToVoiceStudio && (
            <button
              onClick={() => {
                if (!currentText.trim()) {
                  error('Please write or generate some text first');
                  return;
                }
                onSendToVoiceStudio(currentText);
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Send to Voice Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Sub-Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#0c0d15] border-b border-slate-800/80 text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1">
          {[
            { id: 'home', label: 'Studio Dashboard', icon: Sparkles },
            { id: 'editor', label: 'Smart Editor', icon: FileText },
            { id: 'timeline', label: 'Timeline Script Builder', icon: Layers },
            { id: 'ideas', label: 'Viral Ideas & Hooks', icon: Lightbulb },
            { id: 'chat', label: 'AI Writing Assistant', icon: MessageSquare },
            { id: 'documents', label: 'Documents & History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeDocumentId && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Doc:</span>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-purple-200 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Main Workspace View Switcher */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ========================================================= */}
        {/* 1. STUDIO DASHBOARD ("What do you want to create?") */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Master AI Prompt Hero Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121324] via-[#0f101d] to-[#0a0b12] border border-purple-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>What do you want to create?</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Tool: <strong className="text-white">{selectedTool.name}</strong> ({selectedTool.category})
                </span>
              </div>

              {/* Large Input Box */}
              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder={`e.g. "${selectedTool.exampleTopic}" or describe your topic, target audience, and key goals...`}
                  className="w-full bg-[#08090f] border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Smart Quick Auto-Suggestion Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-500">Quick Prompts:</span>
                {[
                  'Write a 60-second motivational YouTube Short about starting from zero',
                  'Generate 5 high-converting LinkedIn thought-leadership posts',
                  'Create an irresistible PAS commercial ad for a SaaS product',
                  'Draft a podcast intro hook discussing neural AI voices',
                ].map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(sugg);
                      handleGenerate(undefined, sugg);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-purple-600/30 text-slate-400 hover:text-purple-200 border border-slate-800 hover:border-purple-500/40 transition-all text-left"
                  >
                    "{sugg.substring(0, 45)}..."
                  </button>
                ))}
              </div>

              {/* Master Control Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {/* Language */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-purple-400" />
                    <span>Language</span>
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Roman Urdu">Roman Urdu</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Chinese">Chinese (Mandarin)</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>

                {/* Tone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Smile className="w-3 h-3 text-purple-400" />
                    <span>Tone & Voice</span>
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Professional & Confident">Professional & Confident</option>
                    <option value="Conversational & Friendly">Conversational & Friendly</option>
                    <option value="Persuasive & Direct Response">Persuasive & High Converting</option>
                    <option value="Inspirational & Motivational">Inspirational & Motivational</option>
                    <option value="Urgent & Scarcity">Urgent & High Energy</option>
                    <option value="Storytelling & Narrative">Storytelling & Emotional</option>
                    <option value="Humorous & Witty">Humorous & Witty</option>
                    <option value="Educational & Authoritative">Educational & Authoritative</option>
                  </select>
                </div>

                {/* Length */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Length / Duration</span>
                  </label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Short (<30s)">Short (under 30s / ~75 words)</option>
                    <option value="Medium (1-2 min)">Medium (1-2 min / ~250 words)</option>
                    <option value="Long (3-5 min)">Long (3-5 min / ~600 words)</option>
                    <option value="Comprehensive Guide">Comprehensive (1000+ words)</option>
                  </select>
                </div>

                {/* Audience */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Target className="w-3 h-3 text-purple-400" />
                    <span>Target Audience</span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Tech Founders & Creators"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSeoMode(!isSeoMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSeoMode
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SEO Keywords: {isSeoMode ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateIdeas}
                    disabled={isGeneratingIdeas}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>20 Viral Ideas</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerate('generate')}
                    disabled={isGenerating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    <span>{isGenerating ? 'Crafting Content with Gemini...' : 'Generate Content'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SEO Keyword Box if enabled */}
              {isSeoMode && (
                <div className="p-3.5 rounded-2xl bg-[#08090e] border border-purple-500/40 space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-purple-300">
                    Primary & Secondary Keywords (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="e.g. AI voice generator, speech synthesis, realistic TTS, voice cloning"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Template Library / 45+ Content Tools */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white">Select Content Template</h2>
                  <span className="text-xs text-slate-500 font-mono">({TOOLS.length} templates)</span>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All (45+)' },
                    { id: 'social', label: 'Social Media' },
                    { id: 'marketing', label: 'Marketing & Ads' },
                    { id: 'business', label: 'Business & Email' },
                    { id: 'creative', label: 'Creative & Story' },
                    { id: 'education', label: 'Education & Study' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTools.map((tool) => {
                  const isSelected = selectedTool.id === tool.id;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool);
                        setTopic(tool.exampleTopic);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-600/10'
                          : 'bg-[#11121c] border-slate-800/80 hover:border-slate-700 hover:bg-[#151624]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{tool.icon}</span>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                            {tool.category}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool(tool);
                          setTopic(tool.exampleTopic);
                          handleGenerate('generate', tool.exampleTopic);
                        }}
                        className="w-full py-1.5 rounded-xl bg-slate-900/80 group-hover:bg-purple-600 text-slate-300 group-hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 mt-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SMART EDITOR WORKSPACE */}
        {/* ========================================================= */}
        {activeTab === 'editor' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Editor Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#11121c] border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedTool.icon}</span>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{docTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                      {selectedTool.name}
                    </span>
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Language: <strong className="text-slate-200">{selectedLanguage}</strong> • Tone: <strong className="text-slate-200">{selectedTone}</strong>
                  </span>
                </div>
              </div>

              {/* Quick AI Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleAiAction('improve')}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Improve Writing</span>
                </button>

                <button
                  onClick={() => handleAiAction('shorten')}
                  disabled={isGenerating}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
                >
                  Make Shorter
                </button>

                <button
                  onClick={() => handleAiAction('expand')}
                  disabled={isGenerating}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
                >
                  Expand
                </button>

                <button
                  onClick={() => handleAiAction('grammar')}
                  disabled={isGenerating}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
                >
                  Fix Grammar
                </button>

                <button
                  onClick={handleSaveDocument}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Save Version</span>
                </button>

                {/* Export Dropdown */}
                <button
                  onClick={() => handleExportText('txt')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1"
                  title="Download as .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.txt</span>
                </button>
                <button
                  onClick={() => handleExportText('md')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1"
                  title="Download as Markdown .md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.md</span>
                </button>
              </div>
            </div>

            {/* Smart Rich Editor Component */}
            <WritingSmartEditor
              content={currentText}
              onChange={(newVal) => setCurrentText(newVal)}
              onAiAction={(action, customText) => handleAiAction(action, customText)}
              onTranslate={(lang) => handleTranslate(lang)}
              onSendToVoice={(text) => {
                if (onSendToVoiceStudio) onSendToVoiceStudio(text);
              }}
              isGenerating={isGenerating}
              placeholder="Start writing or use / for AI commands (e.g. /rewrite, /expand, /grammar, /summarize)..."
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. TIMELINE SCRIPT BUILDER */}
        {/* ========================================================= */}
        {activeTab === 'timeline' && (
          <div className="animate-in fade-in duration-150">
            <ScriptBuilderTimeline
              initialTopic={topic}
              language={selectedLanguage}
              tone={selectedTone}
              onSendToVoiceStudio={onSendToVoiceStudio}
              onInsertToEditor={(script) => {
                setCurrentText(script);
                setActiveTab('editor');
                success('Inserted timeline script into Smart Editor!');
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. VIRAL IDEAS & HOOKS GENERATOR */}
        {/* ========================================================= */}
        {activeTab === 'ideas' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-[#11121c] border border-slate-800">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Viral Ideas, Hooks & High-CTR Titles</span>
                </h2>
                <p className="text-xs text-slate-400">
                  20 video ideas, 20 scroll-stopping hooks, 20 titles, and 10 conversion CTAs.
                </p>
              </div>
              <button
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2"
              >
                {isGeneratingIdeas ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isGeneratingIdeas ? 'Generating...' : 'Generate New 20 Pack'}</span>
              </button>
            </div>

            {ideasPack ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 20 Hooks Card */}
                <div className="p-5 rounded-3xl bg-[#0f1017] border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>20 Scroll-Stopping Hooks</span>
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {ideasPack.hooks.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCurrentText((prev) => `${h}\n\n${prev}`);
                          setActiveTab('editor');
                          success('Prepended hook to editor!');
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-200 cursor-pointer flex items-start gap-2"
                      >
                        <span className="text-[10px] font-mono text-purple-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="flex-1">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 20 High-CTR Titles Card */}
                <div className="p-5 rounded-3xl bg-[#0f1017] border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>20 High-CTR Titles</span>
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {ideasPack.titles.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setDocTitle(t);
                          setActiveTab('editor');
                          success('Set as document title!');
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-200 cursor-pointer flex items-start gap-2"
                      >
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="flex-1">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl bg-[#0f1017] border border-slate-800 text-slate-500 space-y-3">
                <Lightbulb className="w-10 h-10 mx-auto text-amber-500/60" />
                <p className="text-xs font-semibold">Click "Generate 20 Pack" above to create viral ideas.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. AI WRITING ASSISTANT CHAT */}
        {/* ========================================================= */}
        {activeTab === 'chat' && (
          <div className="h-[600px] flex flex-col rounded-3xl bg-[#0f1017] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-150">
            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.role === 'assistant' && i > 0 && (
                      <button
                        onClick={() => {
                          setCurrentText((prev) => `${prev}\n\n${msg.text}`);
                          setActiveTab('editor');
                          success('Inserted AI response to document!');
                        }}
                        className="text-[10px] text-purple-300 hover:text-white font-bold flex items-center gap-1 pt-1 border-t border-slate-800 cursor-pointer"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Insert in Document</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Writing Co-Pilot is thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-[#121320] border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage();
                }}
                placeholder="Ask the AI co-pilot anything (e.g. 'Give me 3 witty opening lines for this script')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. DOCUMENTS & VERSION HISTORY */}
        {/* ========================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#11121c] border border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Saved Documents & Version History
              </span>
              <button
                onClick={() => {
                  setActiveDocumentId(null);
                  setDocTitle('New Untitled Document');
                  setCurrentText('');
                  setActiveTab('editor');
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Blank Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocumentId(doc.id);
                    setDocTitle(doc.title);
                    setCurrentText(doc.content);
                    setActiveTab('editor');
                  }}
                  className="p-4 rounded-2xl bg-[#0f1017] border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-purple-300">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.content || 'Empty document.'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>{doc.versions?.length || 1} versions</span>
                    <span className="text-purple-400 group-hover:underline">Open in Editor →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRepurposerModal && (
        <ContentRepurposerModal
          initialContent={currentText}
          onInsertToEditor={(text) => {
            setCurrentText(text);
            setActiveTab('editor');
          }}
          onClose={() => setShowRepurposerModal(false)}
        />
      )}

      {showQualityModal && (
        <ContentQualityModal
          content={currentText}
          language={selectedLanguage}
          onClose={() => setShowQualityModal(false)}
        />
      )}

      {showBrandVoiceModal && (
        <BrandVoiceModal
          brandVoices={brandVoices}
          activeBrandVoiceId={activeBrandVoiceId}
          onSelectBrandVoice={(id) => setActiveBrandVoiceId(id)}
          onRefreshVoices={fetchBrandVoices}
          onClose={() => setShowBrandVoiceModal(false)}
        />
      )}

      {showVideoWorkflowModal && (
        <WritingVideoWorkflowModal
          scriptContent={currentText}
          onSendToVoiceStudio={onSendToVoiceStudio}
          onClose={() => setShowVideoWorkflowModal(false)}
        />
      )}
    </div>
  );
};
