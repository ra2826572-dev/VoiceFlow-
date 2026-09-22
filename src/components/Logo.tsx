import React, { useState } from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'full' | 'icon-only' | 'hero';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  onClick,
  variant = 'full',
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', badge: 'rounded-lg p-0.5', subtitle: 'text-[9px]' },
    sm: { icon: 'w-8 h-8', text: 'text-base', badge: 'rounded-xl p-0.5', subtitle: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', badge: 'rounded-xl p-0.5', subtitle: 'text-[11px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', badge: 'rounded-2xl p-1', subtitle: 'text-xs' },
    xl: { icon: 'w-24 h-24', text: 'text-4xl', badge: 'rounded-3xl p-1.5', subtitle: 'text-sm' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} group ${className}`}
      id="brand-logo"
    >
      {/* 3D Glowing Microphone Logo Mark */}
      <div
        className={`relative flex items-center justify-center bg-slate-950 border border-purple-500/30 shadow-lg shadow-purple-600/25 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300 overflow-hidden ${dimensions.icon} ${dimensions.badge}`}
      >
        {/* Subtle Ambient Radial Glow */}
        <span className="absolute inset-0 bg-radial from-cyan-500/20 via-purple-600/25 to-transparent blur-xs pointer-events-none" />

        {!imageError ? (
          <img
            src="/logo.png"
            alt="VoiceFlow AI Logo"
            className="w-full h-full object-cover rounded-inherit relative z-10"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* SVG Vector Recreation of the AI Voice Studio Logo */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 p-0.5"
          >
            <defs>
              <linearGradient id="logo-border-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="logo-ai-grad" x1="20" y1="25" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="logo-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0a192f" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Background */}
            <rect x="6" y="6" width="88" height="88" rx="20" fill="url(#logo-bg-grad)" stroke="url(#logo-border-grad)" strokeWidth="6" />

            {/* Sound Wave Line */}
            <path
              d="M48 50 L53 50 L56 42 L59 58 L62 46 L65 54 L68 50 L84 50"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Letter 'A' */}
            <path
              d="M22 68 L33 32 L42 32 L53 68 L44 68 L41.5 59 L33.5 59 L31 68 Z M35.5 52 L39.5 52 L37.5 42 Z"
              fill="url(#logo-ai-grad)"
              filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
            />

            {/* Letter 'I' */}
            <path
              d="M57 32 L65 32 L65 68 L57 68 Z"
              fill="url(#logo-ai-grad)"
              filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
            />

            {/* Microphone Icon in Bottom Right */}
            <g transform="translate(68, 60) scale(0.7)">
              <rect x="7" y="3" width="8" height="13" rx="4" fill="#38bdf8" />
              <path d="M4 10 C4 16 18 16 18 10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="11" y1="16" x2="11" y2="21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="21" x2="15" y2="21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        )}
      </div>

      {/* Typography: VoiceFlow AI */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${dimensions.text}`}>
              VoiceFlow
            </span>
            <span
              className={`font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-violet-500 bg-clip-text text-transparent ${dimensions.text}`}
            >
              AI
            </span>
          </div>

          {(showTagline || variant === 'hero') && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-[1px] w-3 bg-cyan-400" />
              <span
                className={`font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase ${dimensions.subtitle}`}
              >
                AI Voice &amp; Text Studio
              </span>
              <span className="h-[1px] w-3 bg-purple-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

