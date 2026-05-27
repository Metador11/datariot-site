/**
 * Datariot Theme
 * Cyber-Elite Style: Obsidian (#000814), Neon Azure (#0EA5E9), White (#FFFFFF)
 */

export const colors = {
    // Primary - Vivid Ice Blue (Logo Accent)
    primary: {
        DEFAULT: '#D9E4FF', // Light Ice Blue
        light: '#FFFFFF',
        dark: '#BDEBFF',
        ultra: '#E0F2FE',
        brand: '#D9E4FF',
        onPrimary: '#000000',
        glow: 'rgba(217, 228, 255, 0.4)',
    },

    // Secondary
    secondary: {
        DEFAULT: '#BDEBFF',
        dark: '#A5C6FF',
        light: '#FFFFFF',
        onSecondary: '#000000',
        glow: 'rgba(217, 228, 255, 0.25)',
    },

    // Backgrounds - Pure Black / Dark Gray
    background: {
        primary: '#000000', // Pure Black
        DEFAULT: '#000000',
        paper: '#0A0A0A',
        secondary: '#121212',
        tertiary: '#1A1A1A',
        web: '#000000',
        webSecondary: '#0A0A0A',
    },

    // Surfaces - Glassmorphic
    surface: {
        DEFAULT: 'rgba(10, 10, 10, 0.75)',
        light: 'rgba(20, 20, 20, 0.75)',
        overlay: 'rgba(0, 0, 0, 0.9)',
        card: 'rgba(10, 10, 10, 0.55)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
    },

    // Text colors
    text: {
        primary: '#FFFFFF', // White
        secondary: 'rgba(255, 255, 255, 0.75)',
        muted: 'rgba(255, 255, 255, 0.45)',
        accent: '#D9E4FF',
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
