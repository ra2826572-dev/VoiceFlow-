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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  subscription: 'free' | 'creator' | 'pro' | 'business';
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
