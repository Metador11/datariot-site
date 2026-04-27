/**
 * Datariot Theme
 * Cyber-Elite Style: Obsidian (#000814), Neon Azure (#0EA5E9), White (#FFFFFF)
 */

export const colors = {
    // Primary - Neon Azure
    primary: {
        DEFAULT: '#38BDF8', // Restored Vivid Ice Blue
        light: '#7DD3FC',
        dark: '#0EA5E9',
        ultra: '#E0F2FE',
        brand: '#BDEBFF', // Core Pale Ice for Logo
        onPrimary: '#FFFFFF',
        glow: 'rgba(56, 189, 248, 0.4)',
    },

    // Secondary - Cyan Glow
    secondary: {
        DEFAULT: '#06B6D4',
        dark: '#0891B2',
        light: '#22D3EE',
        onSecondary: '#FFFFFF',
        glow: 'rgba(6, 182, 212, 0.3)',
    },

    // Backgrounds - Obsidian
    background: {
        primary: '#000814',
        DEFAULT: '#000814',
        paper: '#020617',
        secondary: '#0F172A',
        tertiary: '#1E293B',
        web: '#000814',
        webSecondary: '#020617',
    },

    // Surfaces - Glassmorphic
    surface: {
        DEFAULT: 'rgba(15, 23, 42, 0.8)',
        light: 'rgba(30, 41, 59, 0.8)',
        overlay: 'rgba(0, 8, 20, 0.85)',
        card: 'rgba(15, 23, 42, 0.65)',
        border: 'rgba(14, 165, 233, 0.2)',
        borderHover: 'rgba(14, 165, 233, 0.5)',
    },

    // Text colors
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        muted: 'rgba(255, 255, 255, 0.45)',
        accent: '#0EA5E9',
    },

    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Special
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
} as const;

export const typography = {
    fontFamilies: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        bold: 'Oxanium_700Bold',
        tech: 'Oxanium_500Medium',
        brand: 'Syncopate_700Bold', // Minimalist Wide Tech Font
        mono: 'SpaceGrotesk_400Regular',
    },

    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;

export const animation = {
    duration: {
        fast: 150,
        normal: 250,
        slow: 350,
    },
    easing: {
        default: 'ease-in-out',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
} as const;

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
} as const;

export type Theme = typeof theme;
