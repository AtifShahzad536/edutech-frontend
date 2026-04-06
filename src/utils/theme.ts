import { Theme } from '@/types';

export const lightTheme: Theme = {
  primary: '#4f46e5',
  secondary: '#6366f1',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const darkTheme: Theme = {
  primary: '#6366f1',
  secondary: '#818cf8',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const getTheme = (themeMode: 'light' | 'dark'): Theme => {
  return themes[themeMode];
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-text', theme.text);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-error', theme.error);
  root.style.setProperty('--color-warning', theme.warning);
};
