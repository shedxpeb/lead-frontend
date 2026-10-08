import { ThemeConfig } from './types';

export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    background: '#F7FAFC',
    foreground: '#1E293B',
    card: '#FFFFFF',
    cardForeground: '#1E293B',
    cardHover: '#F0F9FF',
    border: '#E8EDF3',
    input: '#FFFFFF',
    ring: '#3ABEFF',
    primary: '#3ABEFF',
    primaryForeground: '#FFFFFF',
    secondary: '#F1F5F9',
    secondaryForeground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    accent: '#EAF8FF',
    accentForeground: '#0F172A',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    sidebar: '#FFFFFF',
    navbar: '#FFFFFF',
    tableHeader: '#F4F8FB',
    glow: 'rgba(58,190,255,0.35)',
    shadow: '0 10px 30px rgba(15,23,42,0.08)',
  },
};

export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    background: '#0A1020',
    foreground: '#F8FAFC',
    card: '#1A2538',
    cardForeground: '#F8FAFC',
    cardHover: '#22314A',
    border: 'rgba(255,255,255,0.08)',
    input: '#182338',
    ring: '#3ABEFF',
    primary: '#3ABEFF',
    primaryForeground: '#FFFFFF',
    secondary: '#1D2940',
    secondaryForeground: '#CBD5E1',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    accent: 'rgba(58,190,255,0.15)',
    accentForeground: '#F8FAFC',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    sidebar: '#131D31',
    navbar: '#121B2D',
    tableHeader: '#162235',
    glow: 'rgba(58,190,255,0.25)',
    shadow: '0 10px 24px rgba(0,0,0,0.20)',
  },
};

export const themes: Record<string, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
};

export function getThemeConfig(theme: 'light' | 'dark'): ThemeConfig {
  return themes[theme] || lightTheme;
}
