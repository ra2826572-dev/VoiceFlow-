import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  avatarUrl?: string;
  name?: string;
  className?: string;
  id?: string;
  showStatusDot?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  avatarUrl,
  name,
  className = '',
  id,
  showStatusDot = true,
}) => {
  const { user, getInitials } = useAuth();
  const [imageError, setImageError] = useState(false);

  const currentAvatar = avatarUrl !== undefined ? avatarUrl : user?.avatar;
  const currentName = name || user?.name || 'User';
  const initials = getInitials(currentName);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  if (currentAvatar && !imageError) {
    return (
      <div className="relative inline-flex shrink-0">
        <div
          id={id}
          className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-purple-500/20 shadow-sm ${sizeClasses[size]} ${className}`}
        >
          <img
            src={currentAvatar}
            alt={currentName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        </div>
        {showStatusDot && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0d14]" />
        )}
      </div>
    );
  }

  // Initials Avatar with distinctive luxury gradient
  return (
    <div className="relative inline-flex shrink-0">
      <div
        id={id}
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ring-2 ring-purple-500/30 bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 select-none ${sizeClasses[size]} ${className}`}
        title={currentName}
      >
        <span>{initials}</span>
      </div>
      {showStatusDot && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0d14]" />
      )}
    </div>
  );
};
