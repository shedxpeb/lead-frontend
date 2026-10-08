'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from './types';
import { getThemeConfig } from './colors';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user-panel-theme';
const DEFAULT_THEME: Theme = 'light';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light' as Theme,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Read theme from localStorage after hydration
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const themeConfig = getThemeConfig(theme);
    const colors = themeConfig.colors;

    document.documentElement.setAttribute('data-theme', theme);

    const root = document.documentElement;
    const body = document.body;

    body.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, background 0.3s ease';
    root.style.setProperty('--transition-duration', '0.3s');

    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--card-hover', colors.cardHover);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.input);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--destructive', colors.destructive);
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
    root.style.setProperty('--sidebar', colors.sidebar);
    root.style.setProperty('--navbar', colors.navbar);
    root.style.setProperty('--table-header', colors.tableHeader);
    root.style.setProperty('--glow', colors.glow);
    root.style.setProperty('--shadow', colors.shadow);

    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Failed to save theme to localStorage
    }
  }, [theme, isMounted, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isMounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
