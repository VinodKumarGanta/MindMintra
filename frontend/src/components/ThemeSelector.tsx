import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeSelector({ compact = false, className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: any }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Laptop },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Appearance theme selector"
      className={`inline-flex items-center p-1 rounded-xl bg-slate-900/60 light:bg-slate-200/70 border border-indigo-500/20 backdrop-blur-md transition-all shadow-inner ${className}`}
      style={{
        background: 'var(--selector-bg, rgba(15, 23, 42, 0.6))',
        borderColor: 'var(--card-border, rgba(99, 102, 241, 0.2))',
      }}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.mode;

        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.mode)}
            title={`${opt.label} Mode`}
            className={`relative flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            style={{
              color: isActive ? '#ffffff' : 'var(--text-muted, #94a3b8)',
            }}
          >
            <Icon size={14} className={isActive ? 'text-white' : 'currentColor'} />
            {!compact && <span className="hidden sm:inline">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
