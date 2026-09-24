import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, LanguageCode, PitchLevel } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string, name?: string, username?: string) => Promise<boolean>;
  signup: (name: string, username: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateAvatar: (avatarDataUrl: string) => Promise<boolean>;
  getInitials: (name?: string) => string;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-guest',
  name: 'Guest User',
  username: 'guest_user',
  email: '',
  avatar: '',
  role: 'user', // STRICT SECURITY: Default role is always 'user'
  provider: 'email',
  emailVerified: false,
  status: 'active',
  createdAt: new Date().toISOString(),
  subscription: 'free',
  charactersUsed: 0,
  characterLimit: 15000,
  audioGeneratedMinutes: 0,
  audioMinutesLimit: 15,
  conversionsCount: 0,
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
      const isSessionActive = sessionStorage.getItem('voiceflow_session_logged_in') === 'true';
      if (!isSessionActive) {
        return null;
      }
      const stored = localStorage.getItem('voiceflow_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
      return null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync profile from backend if available and session is active
  useEffect(() => {
    const isSessionActive = typeof window !== 'undefined' && sessionStorage.getItem('voiceflow_session_logged_in') === 'true';
    if (!isSessionActive) return;

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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('voiceflow_session_logged_in', 'true');
        localStorage.setItem('voiceflow_user', JSON.stringify(updated));
        if (updated.username) localStorage.setItem('voiceflow_last_username', updated.username);
        if (updated.name) localStorage.setItem('voiceflow_last_name', updated.name);
      }
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('voiceflow_session_logged_in');
        localStorage.removeItem('voiceflow_user');
      }
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

  const login = async (
    identifier: string,
    password?: string,
    name?: string,
    username?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const cleanUsername = (username || (identifier.includes('@') ? identifier.split('@')[0] : identifier)).replace(/^@/, '');
    const cleanName = name || cleanUsername;

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, username: cleanUsername, name: cleanName, password }),
      });
      let profileData = { ...DEFAULT_USER };
      if (res.ok) {
        const data = await res.json();
        if (data.user) profileData = { ...profileData, ...data.user };
      }
      if (identifier.includes('@')) {
        profileData.email = identifier;
      } else {
        profileData.email = identifier + '@voiceflow.ai';
      }
      profileData.username = cleanUsername;
      profileData.name = cleanName;
      saveUser(profileData);
      setIsLoading(false);
      return true;
    } catch {
      // Local fallback
      const updated: UserProfile = {
        ...(user || DEFAULT_USER),
        email: identifier.includes('@') ? identifier : `${identifier}@voiceflow.ai`,
        username: cleanUsername,
        name: cleanName,
      };
      saveUser(updated);
      setIsLoading(false);
      return true;
    }
  };

  const signup = async (
    name: string,
    username: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
      let newUser: UserProfile = {
        ...DEFAULT_USER,
        id: 'user-' + Date.now(),
        name,
        username,
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
        username,
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
      const defaultGoogleEmail = 'creator.google@voiceflow.ai';
      const defaultGoogleName = 'Google Creator';
      const defaultGoogleAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: defaultGoogleEmail,
          name: defaultGoogleName,
          avatar: defaultGoogleAvatar,
        }),
      });

      let googleUser: UserProfile = {
        ...DEFAULT_USER,
        id: 'user-' + Date.now(),
        name: defaultGoogleName,
        email: defaultGoogleEmail,
        avatar: defaultGoogleAvatar,
        role: 'user', // Default role is always user
        provider: 'google',
        emailVerified: true,
      };

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          googleUser = { ...googleUser, ...data.user };
        }
      }
      saveUser(googleUser);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    try {
      if (user?.email) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        }).catch(() => {});
      }
    } catch {}
    sessionStorage.removeItem('vf_admin_unlocked');
    sessionStorage.removeItem('vf_admin_token');
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

  const role = user?.role || (user?.email === 'ra2826572@gmail.com' ? 'super_admin' : 'user');
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = isSuperAdmin || role === 'admin';
  const isModerator = isAdmin || role === 'moderator';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin,
        isSuperAdmin,
        isModerator,
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
