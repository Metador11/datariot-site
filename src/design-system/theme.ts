/**
 * Orvelis Theme
 * Blue-focused color palette for educational content platform
 */

export const colors = {
    // Primary - Sky Blue (Logo Color)
    primary: {
        DEFAULT: '#0EA5E9',
        light: '#38BDF8',
        dark: '#0369A1',
        ultra: '#075985',
        glow: 'rgba(14, 165, 233, 0.15)',
    },

    // Secondary - Matching Sky Blue for consistency
    secondary: {
        DEFAULT: '#0EA5E9',
        dark: '#0369A1',
        light: '#38BDF8',
        glow: 'rgba(14, 165, 233, 0.12)',
    },

    // Backgrounds - Pure Black & Obsidian
    background: {
        primary: '#000000', // Added back for compatibility
        DEFAULT: '#000000', // Pure Black
        paper: '#020408',   // Obsidian
        secondary: '#05070A',
        tertiary: '#0F172A',
        // Web specific
        web: '#000000',
        webSecondary: '#020408',
    },


    // Surface colors - Cinematic Blur / Glass
    surface: {
        DEFAULT: '#0F172A',
        light: '#1E293B',
        overlay: 'rgba(2, 4, 8, 0.8)',
        // Web specific
        card: 'rgba(15, 23, 42, 0.8)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
    },

    // Text colors - High Contrast B&W
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
        regular: 'System',
        medium: 'System',
        bold: 'System',
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
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
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
