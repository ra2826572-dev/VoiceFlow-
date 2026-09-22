import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { SUPPORTED_LANGUAGES, VOICES_CATALOG } from '../data/voices';
import { LanguageCode, PitchLevel } from '../types';
import {
  User,
  Mail,
  Camera,
  Upload,
  Sparkles,
  CreditCard,
  Sliders,
  Check,
  Shield,
  Trash2,
  Calendar,
  Save,
  RotateCw,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onNavigateToPricing: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  onNavigateToPricing,
}) => {
  const { user, updateProfile, updateAvatar, getInitials } = useAuth();
  const { success, error } = useToast();
  const { theme, setTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || 'Rizwan Ahmad');
  const [email] = useState(user?.email || 'ra2826572@gmail.com');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    user?.preferredLanguage || 'ur'
  );
  const [preferredVoiceId, setPreferredVoiceId] = useState(
    user?.preferredVoiceId || 'voice-ur-zara'
  );
  const [preferredSpeed, setPreferredSpeed] = useState(user?.preferredSpeed || 1.0);
  const [preferredPitch, setPreferredPitch] = useState<PitchLevel>(
    user?.preferredPitch || 'normal'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateAvatar(dataUrl);
      success('Profile picture updated across the app!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetUrl: string) => {
    await updateAvatar(presetUrl);
    if (!presetUrl) {
      success('Switched to Initials Avatar (' + getInitials(name) + ')');
    } else {
      success('Avatar photo updated!');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        preferredLanguage,
        preferredVoiceId,
        preferredSpeed,
        preferredPitch,
      });
      success('Settings and studio preferences saved!');
    } catch {
      error('Failed to save profile updates');
    } finally {
      setIsSaving(false);
    }
  };

  const characterPercent = Math.min(
    100,
    Math.round(((user?.charactersUsed || 14250) / (user?.characterLimit || 100000)) * 100)
  );

  return (
    <div id="profile-settings-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Profile & Studio Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile picture, initials, studio defaults, and subscription tier.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Profile Picture & Initials Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Profile Picture & Display Avatar</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <UserAvatar size="2xl" className="ring-4 ring-purple-500/20 shadow-md" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-slate-950/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-semibold transition-opacity cursor-pointer"
            >
              <Upload className="w-5 h-5 mb-1" />
              <span>Change</span>
            </button>
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">{name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-purple-500" />
                <span>Upload New Picture</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('')}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 text-xs font-semibold hover:bg-purple-100 transition-colors"
              >
                Use Initials ({getInitials(name)})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subscription & Quota
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white">
              {user?.subscription || 'pro'} plan
            </span>
          </div>

          <button
            onClick={onNavigateToPricing}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Upgrade Plan
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Character Allocation Used</span>
            <span className="font-mono text-slate-200">
              {(user?.charactersUsed || 14250).toLocaleString()} / {(user?.characterLimit || 100000).toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              style={{ width: `${characterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Personal Info & Studio Defaults Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Studio Defaults */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Studio Voice Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Studio Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default AI Voice
              </label>
              <select
                value={preferredVoiceId}
                onChange={(e) => setPreferredVoiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {VOICES_CATALOG.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} — {voice.languageName} ({voice.gender})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Speed ({preferredSpeed.toFixed(2)}x)
              </label>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={preferredSpeed}
                onChange={(e) => setPreferredSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Pitch
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'normal', 'high'] as PitchLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreferredPitch(p)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      preferredPitch === p
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
