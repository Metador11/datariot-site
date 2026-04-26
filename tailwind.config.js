module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0EA5E9',
                    dark: '#0284C7',
                    light: '#38BDF8',
                },
                secondary: {
                    DEFAULT: '#06B6D4',
                    dark: '#0891B2',
                    light: '#22D3EE',
                },
                background: {
                    DEFAULT: '#000814',
                    light: '#0F172A',
                    paper: '#020617',
                },
                surface: {
                    DEFAULT: 'rgba(15, 23, 42, 0.8)',
                    light: 'rgba(30, 41, 59, 0.8)',
                },
            },
        },
    },
    plugins: [],
};
