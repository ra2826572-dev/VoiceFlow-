import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserUsageSummary, FeatureUsageType } from '../types';
import { useAuth } from './AuthContext';
import { LimitReachedModal } from '../components/LimitReachedModal';

interface UsageContextType {
  usage: UserUsageSummary | null;
  isLoading: boolean;
  refreshUsage: () => Promise<void>;
  checkLimit: (feature: FeatureUsageType) => boolean;
  getRemaining: (feature: FeatureUsageType) => number | 'Unlimited';
  showLimitModal: (feature: FeatureUsageType) => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [usage, setUsage] = useState<UserUsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limitModal, setLimitModal] = useState<{ isOpen: boolean; feature: FeatureUsageType | null }>({
    isOpen: false,
    feature: null,
  });

  const refreshUsage = useCallback(async () => {
    if (!isAuthenticated || !user?.email) {
      setUsage(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/usage/my-status?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'x-user-email': user.email
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsage(data.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const checkLimit = (feature: FeatureUsageType): boolean => {
    if (!usage) return true; // Assume allowed if not loaded yet
    if (usage.isUnlimitedAdmin) return true;
    
    const featUsage = usage.features[feature];
    if (!featUsage) return true;
    
    return featUsage.used < featUsage.limit;
  };

  const getRemaining = (feature: FeatureUsageType): number | 'Unlimited' => {
    if (!usage) return 0;
    if (usage.isUnlimitedAdmin) return 'Unlimited';
    
    const featUsage = usage.features[feature];
    if (!featUsage) return 0;
    
    return Math.max(0, featUsage.limit - featUsage.used);
  };

  const showLimitModal = (feature: FeatureUsageType) => {
    setLimitModal({ isOpen: true, feature });
  };

  return (
    <UsageContext.Provider value={{ usage, isLoading, refreshUsage, checkLimit, getRemaining, showLimitModal }}>
      {children}
      {limitModal.feature && usage && (
        <LimitReachedModal
          isOpen={limitModal.isOpen}
          onClose={() => setLimitModal({ ...limitModal, isOpen: false })}
          feature={limitModal.feature}
          featureName={limitModal.feature.replace(/_/g, ' ')}
          limit={usage.features[limitModal.feature]?.limit || 0}
          onUpgrade={() => {
            setLimitModal({ ...limitModal, isOpen: false });
            // This is a bit tricky since we don't have navigate here.
            // We'll rely on the app's view state or window events.
            window.dispatchEvent(new CustomEvent('navigate-to-billing'));
          }}
        />
      )}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
