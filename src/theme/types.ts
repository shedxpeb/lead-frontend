export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  cardHover: string;
  border: string;
  input: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  sidebar: string;
  navbar: string;
  tableHeader: string;
  glow: string;
  shadow: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
}
