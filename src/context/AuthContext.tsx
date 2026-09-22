import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, LanguageCode, PitchLevel } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateAvatar: (avatarDataUrl: string) => Promise<boolean>;
  getInitials: (name?: string) => string;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-1',
  name: 'Rizwan Ahmad',
  email: 'ra2826572@gmail.com',
  avatar: '',
  createdAt: '2026-01-15T10:00:00Z',
  subscription: 'pro',
  charactersUsed: 14874,
  characterLimit: 50000,
  audioGeneratedMinutes: 29.2,
  audioMinutesLimit: 120,
  conversionsCount: 46,
  preferredLanguage: 'ur',
  preferredVoiceId: 'voice-ur-zara',
  preferredSpeed: 1.0,
  preferredPitch: 'normal',
  preferredTheme: 'dark',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voiceflow_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
      // Initialize with default authenticated user as specified
      return DEFAULT_USER;
    }
    return DEFAULT_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync profile from backend if available
  useEffect(() => {
    const fetchRemoteProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setUser((prev) => {
              const merged = { ...(prev || DEFAULT_USER), ...data.profile };
              localStorage.setItem('voiceflow_user', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (e) {
        // Backend offline or error, use local state
      }
    };
    fetchRemoteProfile();
  }, []);

  const saveUser = useCallback((updated: UserProfile | null) => {
    setUser(updated);
    if (updated) {
      localStorage.setItem('voiceflow_user', JSON.stringify(updated));
    } else {
      localStorage.removeItem('voiceflow_user');
    }
  }, []);

  const getInitials = useCallback((name?: string): string => {
    const targetName = (typeof name === 'string' && name.trim()) ? name.trim() : (user?.name || 'User').trim();
    if (!targetName) return 'VF';
    const parts = targetName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return targetName.substring(0, 2).toUpperCase();
  }, [user]);

  const login = async (email: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let profileData = DEFAULT_USER;
      if (res.ok) {
        const data = await res.json();
        if (data.user) profileData = { ...profileData, ...data.user };
      }
      profileData.email = email;
      if (name) profileData.name = name;
      saveUser(profileData);
      setIsLoading(false);
      return true;
    } catch {
      // Local fallback
      const updated = {
        ...(user || DEFAULT_USER),
        email,
        name: name || user?.name || 'User',
      };
      saveUser(updated);
      setIsLoading(false);
      return true;
    }
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      let newUser: UserProfile = {
        ...DEFAULT_USER,
        id: 'user-' + Date.now(),
        name,
        email,
        avatar: '',
        createdAt: new Date().toISOString(),
        conversionsCount: 0,
        charactersUsed: 0,
        audioGeneratedMinutes: 0,
      };
      if (res.ok) {
        const data = await res.json();
        if (data.user) newUser = { ...newUser, ...data.user };
      }
      saveUser(newUser);
      setIsLoading(false);
      return true;
    } catch {
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        id: 'user-' + Date.now(),
        name,
        email,
        avatar: '',
      };
      saveUser(newUser);
      setIsLoading(false);
      return true;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const googleUser: UserProfile = {
        ...(user || DEFAULT_USER),
        name: 'Rizwan Ahmad',
        email: 'ra2826572@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });
      saveUser(googleUser);
      setIsLoading(false);
      return true;
    } catch {
      saveUser({
        ...(user || DEFAULT_USER),
        name: 'Rizwan Ahmad',
        email: 'ra2826572@gmail.com',
      });
      setIsLoading(false);
      return true;
    }
  };

  const logout = () => {
    saveUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updated = { ...user, ...updates };
    saveUser(updated);

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Backend sync failed, updated locally', e);
    }
    return true;
  };

  const updateAvatar = async (avatarDataUrl: string): Promise<boolean> => {
    if (!user) return false;
    const updated = { ...user, avatar: avatarDataUrl };
    saveUser(updated);

    try {
      await fetch('/api/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarDataUrl }),
      });
    } catch (e) {
      console.warn('Avatar upload sync failed, updated locally', e);
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        updateAvatar,
        getInitials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
