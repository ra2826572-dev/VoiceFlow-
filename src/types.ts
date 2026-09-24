export type LanguageCode =
  | 'en'
  | 'ur'
  | 'ur-roman'
  | 'ar'
  | 'hi'
  | 'pa'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'ja'
  | 'zh'
  | 'tr'
  | 'pt'
  | 'fa'
  | 'ko';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isRtl?: boolean;
  sampleText: string;
}

export type VoiceGender = 'female' | 'male';

export type VoiceEmotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'professional'
  | 'friendly'
  | 'serious'
  | 'storytelling';

export type VoiceStyle =
  | 'natural'
  | 'conversational'
  | 'professional'
  | 'narrator'
  | 'news'
  | 'podcast'
  | 'social_media'
  | 'character'
  | 'storytelling';

export type PitchLevel = 'low' | 'normal' | 'high';

export interface Voice {
  id: string;
  name: string;
  gender: VoiceGender;
  language: LanguageCode;
  languageName: string;
  accent: string;
  style: VoiceStyle;
  personality: string;
  avatarUrl: string;
  previewAudioUrl?: string;
  badge?: string;
  isPremium?: boolean;
  isCustom?: boolean;
  customAudioUrl?: string;
}

export interface VoiceSettings {
  speed: number; // 0.5 - 2.0
  pitch: PitchLevel;
  emotion: VoiceEmotion;
  style: VoiceStyle;
}

export type ConversionType = 'text-to-voice' | 'voice-to-text';

export interface ConversionItem {
  id: string;
  type: 'text_to_speech' | 'voice_to_text';
  title: string;
  text: string;
  voiceId?: string;
  voiceName?: string;
  language: string;
  createdAt: string;
  duration?: number;
  audioUrl?: string;
  characterCount?: number;
  settings?: VoiceSettings;
}

export interface ConversionRecord {
  id: string;
  userId: string;
  type: ConversionType;
  inputText: string;
  outputAudioUrl?: string;
  audioFormat?: 'mp3' | 'wav';
  language: string;
  voiceName?: string;
  voiceId?: string;
  speed?: number;
  pitch?: PitchLevel;
  emotion?: VoiceEmotion;
  duration: number; // seconds
  createdAt: string;
  isFavorite?: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export type PaymentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: 'pro' | 'business' | string;
  planName: string;
  amount: string;
  paymentNumber: string; // '03095793662'
  transactionId: string;
  paymentScreenshot?: string;
  senderNumber?: string;
  senderName?: string;
  paymentMethod?: string;
  status: PaymentRequestStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  provider?: 'email' | 'google' | 'github' | 'sso';
  emailVerified?: boolean;
  status?: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin?: string;
  subscription: 'free' | 'creator' | 'pro' | 'business' | 'premium';
  plan?: 'free' | 'creator' | 'pro' | 'business' | 'premium';
  subscriptionStatus?: 'active' | 'pending' | 'past_due' | 'canceled' | 'trialing' | 'inactive';
  renewalDate?: string | null;
  proExpiresAt?: string | null;
  paymentRequestId?: string | null;
  charactersUsed: number;
  characterLimit: number;
  audioGeneratedMinutes: number;
  audioMinutesLimit: number;
  conversionsCount: number;
  preferredLanguage: LanguageCode;
  preferredVoiceId: string;
  preferredSpeed: number;
  preferredPitch: PitchLevel;
  preferredTheme: 'light' | 'dark' | 'system';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// 1. Voice Cloning & Custom Voice Types
export interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent: string;
  sampleDuration: number;
  sampleAudioUrl?: string;
  quality: number;
  createdAt: string;
  status: 'ready' | 'processing';
  consentConfirmed: boolean;
}

export interface CustomVoiceParams {
  name: string;
  gender: 'male' | 'female';
  ageStyle: 'youthful' | 'mature' | 'senior';
  accent: string;
  speakingStyle: VoiceStyle;
  speed: number;
  pitch: PitchLevel;
  stability: number; // 0 - 100%
  expressiveness: number; // 0 - 100%
  emotion: VoiceEmotion;
}

// 2. Multi-Speaker Studio Types
export interface DialogueSpeaker {
  id: string;
  name: string;
  voiceId: string;
  voiceName: string;
  color: string;
  gender: 'male' | 'female';
}

export interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
  audioUrl?: string;
  duration?: number;
  isPlaying?: boolean;
}

// 3. AI Writing Studio Pro Types
export type ScriptCategory = 'social' | 'marketing' | 'business' | 'creative' | 'education' | 'utility';

export type ScriptToolType =
  // Social Media
  | 'youtube'
  | 'youtube_shorts'
  | 'tiktok'
  | 'reel'
  | 'instagram_post'
  | 'instagram_caption'
  | 'facebook_post'
  | 'linkedin_post'
  | 'twitter_post'
  | 'twitter_thread'
  | 'carousel_content'
  // Marketing
  | 'ad'
  | 'product_description'
  | 'landing_page_copy'
  | 'sales_copy'
  | 'marketing_email'
  | 'newsletter'
  | 'cta_generator'
  | 'ad_headlines'
  | 'ad_variations'
  | 'google_ads'
  | 'meta_ads'
  // Business
  | 'business_proposal'
  | 'project_proposal'
  | 'quotation_text'
  | 'business_plan'
  | 'company_profile'
  | 'executive_summary'
  | 'meeting_summary'
  | 'professional_email'
  | 'client_message'
  | 'follow_up_email'
  // Creative
  | 'story'
  | 'short_story'
  | 'poetry'
  | 'song_lyrics'
  | 'rap_lyrics'
  | 'dialogue'
  | 'character_description'
  | 'movie_script'
  | 'voiceover_script'
  | 'podcast'
  // Education
  | 'essay'
  | 'assignment_draft'
  | 'study_notes'
  | 'explanation'
  | 'quiz'
  | 'flashcards'
  | 'qa_pairs'
  | 'lesson_plan'
  // Utility & Enhancement
  | 'blog'
  | 'article'
  | 'caption'
  | 'rewrite'
  | 'grammar'
  | 'summarize';

export interface BrandVoiceProfile {
  id: string;
  name: string;
  targetAudience: string;
  tone: string;
  vocabularyStyle: string;
  writingStyle: string;
  wordsToAvoid: string[];
  preferredCTA: string;
  isDefault?: boolean;
}

export interface WritingDocumentVersion {
  id: string;
  timestamp: string;
  content: string;
  title: string;
  wordCount: number;
}

export interface WritingDocument {
  id: string;
  title: string;
  content: string;
  category: ScriptCategory;
  toolType: ScriptToolType;
  tone: string;
  language: string;
  audience: string;
  isFavorite: boolean;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  versions: WritingDocumentVersion[];
}

export interface ContentQualityAnalysis {
  readabilityScore: number;
  grammarScore: number;
  clarityScore: number;
  toneConsistency: string;
  overallAssessment: string;
  repetitionNotes: string[];
  weakSentences: string[];
  ctaFeedback: string;
  actionableTips: string[];
}

export interface RepurposedContentPack {
  linkedinPost: string;
  instagramCaption: string;
  reelIdeas: string[];
  youtubeShorts: string[];
  twitterThread: string[];
  newsletter: string;
  youtubeScript: string;
  quoteCards: string[];
  shortSummary: string;
}

export interface ScriptTimelineSection {
  id: string;
  stage: 'hook' | 'intro' | 'main' | 'examples' | 'cta' | 'outro';
  title: string;
  text: string;
  estimatedSeconds: number;
  tips: string;
}

// 5. Professional Audio Studio Types
export interface AudioClip {
  id: string;
  name: string;
  startTime: number; // seconds on timeline
  duration: number; // seconds
  trackId: string;
  color: string;
  audioUrl?: string;
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  volume?: number; // 0 - 100
  speed?: number; // 0.5 - 2.0
}

export interface AudioTrack {
  id: string;
  name: string;
  type: 'voice' | 'music' | 'sfx';
  muted: boolean;
  solo: boolean;
  volume: number;
  clips: AudioClip[];
}

// 6. AI Video Dubbing Production Types
export interface VideoSubtitle {
  id: string;
  startTime: number;
  endTime: number;
  originalText: string;
  translatedText: string;
  speaker?: string;
}

export type DubbingStage =
  | 'upload'
  | 'transcription'
  | 'detection'
  | 'translation'
  | 'voice_selection'
  | 'generation'
  | 'replacement'
  | 'subtitles'
  | 'ready';

export type DubbingProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'transcribing'
  | 'translating'
  | 'generating_voice'
  | 'mixing_audio'
  | 'lip_sync'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface DubbingSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  speakerId: string; // e.g. 'speaker-1', 'speaker-2'
  speakerName?: string;
  originalText: string;
  translatedText: string;
  voiceId: string;
  voiceName?: string;
  audioUrl?: string;
  speed: number;
  pitch: string;
  volume: number;
  status: 'pending' | 'generating' | 'ready' | 'error';
}

export interface DubbingSpeaker {
  id: string; // 'speaker-1'
  name: string; // 'Speaker 1'
  gender: 'male' | 'female';
  assignedVoiceId: string;
  assignedVoiceName: string;
  color: string;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number; // in px (e.g. 14, 16, 20)
  color: string; // hex
  backgroundColor: string; // hex
  backgroundOpacity: number; // 0 - 100
  position: 'bottom' | 'top' | 'center';
  textShadow: boolean;
  bold: boolean;
  borderWidth?: number;
}

export interface AudioMixingConfig {
  dubbedVoiceVolume: number; // 0 - 100
  originalAudioVolume: number; // 0 - 100
  backgroundMusicVolume: number; // 0 - 100
  autoDucking: boolean;
  duckingAmount: number; // % reduction
  noiseReduction: boolean;
  audioNormalization: boolean;
  fadeInOut: boolean;
}

export interface LipSyncConfig {
  enabled: boolean;
  provider: 'gemini_visual_sync' | 'wav2lip_neural' | 'sync_labs';
  faceQuality: 'standard' | 'hd' | 'ultra';
  syncStrength: number; // 0 - 100
}

export interface DubbingProject {
  id: string;
  userId: string;
  name: string;
  originalVideoUrl: string;
  originalVideoName: string;
  videoDuration: number;
  originalLanguage: string;
  targetLanguage: string;
  segments: DubbingSegment[];
  speakers: DubbingSpeaker[];
  audioMixing: AudioMixingConfig;
  lipSync: LipSyncConfig;
  subtitleStyle: SubtitleStyle;
  mixedAudioUrl?: string;
  renderedVideoUrl?: string;
  processingStatus: DubbingProcessingStatus;
  progress: {
    stage: string;
    percent: number;
    transcriptionPercent: number;
    translationPercent: number;
    voiceGenerationPercent: number;
    audioMixingPercent: number;
    renderingPercent: number;
    message: string;
  };
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Project Management Types
export type ProjectType = 'voice' | 'script' | 'audio' | 'video' | 'dubbing' | 'translation';

export interface ProjectItem {
  id: string;
  name: string;
  type: ProjectType;
  folderId?: string | null;
  content: any;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  downloadsCount: number;
  visibility?: 'private' | 'link' | 'public';
  shareId?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// 9. AI Assistant Types
export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioUrl?: string;
  actionTaken?: string;
  appliedContent?: string;
  timestamp: string;
  quickPrompts?: string[];
}

// 10. Billing & SaaS Monetization Types
export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'creator' | 'business';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  characterLimit: number;
  audioMinutesLimit: number;
  features: string[];
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  tier: SubscriptionTier;
  period: 'monthly' | 'annual';
  status: 'paid' | 'pending' | 'failed';
  receiptUrl: string;
}

export interface CreditUsageRecord {
  id: string;
  timestamp: string;
  amount: number;
  action: string;
  type: 'debit' | 'credit';
  balanceAfter: number;
}

// 11. Admin Panel Types
export interface AdminUserProjectItem {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'script' | 'dubbing' | 'clone';
  duration: number;
  language?: string;
  audioUrl?: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'flagged' | 'draft';
}

export interface AdminUserActivityItem {
  id: string;
  type:
    | 'account_created'
    | 'login'
    | 'logout'
    | 'voice_generation'
    | 'script_generation'
    | 'audio_export'
    | 'video_uploaded'
    | 'video_dubbed'
    | 'translation_generated'
    | 'project_created'
    | 'project_deleted'
    | 'subscription_change'
    | 'credit_adjustment'
    | 'voice_cloning'
    | 'signup';
  description: string;
  timestamp: string;
  ip?: string;
  details?: Record<string, any>;
}

export interface AdminManagedUser {
  id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  subscription: SubscriptionTier;
  plan?: SubscriptionTier;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trialing';
  renewalDate?: string;
  credits: number;
  creditsLimit: number;
  charactersUsed: number;
  audioMinutes: number;
  videoMinutes: number;
  voiceGenerations: number;
  aiWritingGenerations: number;
  dubbingUsageMinutes: number;
  creditsConsumed: number;
  status: 'active' | 'suspended' | 'pending';
  isBanned: boolean;
  createdAt: string;
  lastLogin: string;
  loginCount?: number;
  provider: 'email' | 'google' | 'github' | 'sso';
  emailVerified: boolean;
  totalProjects: number;
  generatedAudios: number;
  generatedVideos: number;
  voiceClonesCount?: number;
  projects?: AdminUserProjectItem[];
  activityLogs?: AdminUserActivityItem[];
  billingHistory?: InvoiceRecord[];
}

export interface AdminLiveEvent {
  id: string;
  type: 'user_signup' | 'subscription_upgrade' | 'voice_created' | 'video_dubbed' | 'credits_purchased' | 'login_alert';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  badgeType?: 'success' | 'info' | 'warning' | 'purple';
}

export interface AdminAnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  freeUsers: number;
  proUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  aiGenerationsTotal: number;
  totalAudioMinutes: number;
  totalVideoMinutes: number;
  voiceClonesCount: number;
  apiRequestsTotal: number;
  userGrowthChart?: Array<{ month: string; users: number }>;
  revenueChart?: Array<{ month: string; revenue: number }>;
  aiUsageChart?: Array<{ category: string; count: number; percentage: number }>;
  voiceGenChart?: Array<{ language: string; count: number }>;
  dubbingUsageChart?: Array<{ language: string; minutes: number }>;
  popularVoices?: Array<{ name: string; usagePercent: number }>;
  popularLanguages?: Array<{ name: string; count: number }>;
}

// 12. Marketplace & Sharing Types
export interface MarketplaceVoiceItem {
  id: string;
  name: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorVerified?: boolean;
  gender: VoiceGender;
  language: LanguageCode;
  languageName: string;
  accent: string;
  category: 'Podcast' | 'Cinematic' | 'Anime' | 'Narrator' | 'Commercial' | 'ASMR' | 'Gaming';
  previewAudioUrl: string;
  downloads: number;
  likes: number;
  isFavorite: boolean;
  tags: string[];
  shareUrl: string;
}

// 13. API Platform Types
export interface ApiKeyRecord {
  id: string;
  name: string;
  keyMasked: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
  rateLimitPerMin: number;
}

export interface WebhookRecord {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secretMasked: string;
  createdAt: string;
}

// 14. Team Workspace Types
export interface TeamWorkspaceRecord {
  id: string;
  name: string;
  ownerId: string;
  plan: SubscriptionTier;
  members: TeamMemberRecord[];
  createdAt: string;
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  status: 'active' | 'invited';
}

// 15. Notification Types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'audio' | 'video' | 'clone' | 'billing' | 'system';
  read: boolean;
  timestamp: string;
  linkView?: string;
}

// 16. Help & Support Types
export interface SupportTicketItem {
  id: string;
  subject: string;
  category: 'technical' | 'billing' | 'feature' | 'feedback';
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

// 17. Usage & Limits System Types
export type FeatureUsageType =
  | 'TEXT_TO_VOICE'
  | 'VOICE_TO_TEXT'
  | 'AI_WRITING'
  | 'TRANSLATION'
  | 'OTHER_AI';

export interface FeatureUsageRecord {
  id: string;
  userId: string;
  feature: FeatureUsageType;
  used: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
  updatedAt: string;
}

export interface FeatureUsageStatus {
  feature: FeatureUsageType;
  featureName: string;
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  percentage: number;
}

export interface UserUsageSummary {
  userId: string;
  userEmail: string;
  userName: string;
  role: 'user' | 'admin' | 'super_admin';
  plan: 'free' | 'pro';
  subscriptionStatus: 'active' | 'pending' | 'rejected';
  periodStart: string;
  periodEnd: string;
  isUnlimitedAdmin: boolean;
  features: Record<FeatureUsageType, FeatureUsageStatus>;
}

export interface SystemLimitsConfig {
  freeLimits: Record<FeatureUsageType, number>;
  proLimits: Record<FeatureUsageType, number>;
  resetPeriod: 'monthly' | 'weekly';
  updatedAt?: string;
  updatedBy?: string;
}

export interface UsageAnalyticsOverview {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  adminUsers: number;
  totalUsage: number;
  usageToday: number;
  pendingUpgradeRequests: number;
  featureTotals: Record<FeatureUsageType, number>;
}

