import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme, Theme } from '../../design-system/theme';

export type ThemeMode = 'light' | 'dark';

// Define the shape of our context
interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
    // We provide the full theme object, but with colors swapped based on mode
    theme: Theme;
}

const THEME_STORAGE_KEY = '@orvelis_theme_mode';

// Default values for context creation
const defaultContext: ThemeContextType = {
    mode: 'light', // App is light by default (Pure Light)
    toggleTheme: () => { },
    setThemeMode: () => { },
    theme: baseTheme,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

// --- Theme Palettes ---
// We keep the original colors in baseTheme.colors as the "dark" theme (blue-focused dark mode)
// We extract specific semantic overrides for light mode.

const darkColors = { ...baseTheme.colors };

const lightColors = {
    ...baseTheme.colors,
    background: {
        primary: '#FFFFFF',
        DEFAULT: '#FFFFFF',
        secondary: '#F8FAFC',
        tertiary: '#F1F5F9',
        web: '#F8FAFC',
        webSecondary: '#FFFFFF',
    },

    surface: {
        ...baseTheme.colors.surface,
        DEFAULT: '#FFFFFF',
        light: '#F8FAFC',
        overlay: 'rgba(255, 255, 255, 0.9)',
        card: '#FFFFFF',
        border: 'rgba(15, 23, 42, 0.1)',
        borderHover: 'rgba(15, 23, 42, 0.2)',
    },
    text: {
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',
        accent: '#0EA5E9',
    },
};


interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [mode, setModeState] = useState<ThemeMode>('light');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load saved theme from storage on mount
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedMode === 'light' || savedMode === 'dark') {
                    setModeState(savedMode as ThemeMode);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadTheme();
    }, []);

    const setThemeMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = () => {
        setThemeMode(mode === 'dark' ? 'light' : 'dark');
    };

    // Construct the active theme object
    const activeTheme: Theme = {
        ...baseTheme,
        colors: (mode === 'dark' ? darkColors : lightColors) as typeof baseTheme.colors,
    };

    if (!isLoaded) {
        // You could return null or a splash screen here while loading the preference
        return null;
    }

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setThemeMode, theme: activeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
