/**
 * Available theme options for the ZooQuest app
 */
export type ZooTheme = 'light' | 'dark' | 'system';

/**
 * Theme configuration object for different theme modes
 */
export interface ThemeConfig {
  name: ZooTheme;
  label: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

/**
 * Theme configurations for the app
 */
export const themeConfigs: Record<ZooTheme, ThemeConfig> = {
  light: {
    name: 'light',
    label: 'Light',
    primaryColor: '#10b981', // Emerald 500
    backgroundColor: '#f9fafb', // Gray 50
    textColor: '#111827', // Gray 900
    accentColor: '#3b82f6', // Blue 500
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    primaryColor: '#10b981', // Emerald 500
    backgroundColor: '#111827', // Gray 900
    textColor: '#f9fafb', // Gray 50
    accentColor: '#60a5fa', // Blue 400
  },
  system: {
    name: 'system',
    label: 'System Default',
    primaryColor: '#10b981', // Will be overridden based on system preference
    backgroundColor: '#f9fafb', // Will be overridden based on system preference
    textColor: '#111827', // Will be overridden based on system preference
    accentColor: '#3b82f6', // Will be overridden based on system preference
  },
};
