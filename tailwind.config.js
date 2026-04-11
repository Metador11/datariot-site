module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0066FF',
                    dark: '#0052CC',
                    light: '#3385FF',
                },
                secondary: {
                    DEFAULT: '#00D4FF',
                    dark: '#00A8CC',
                    light: '#33DDFF',
                },
                background: {
                    DEFAULT: '#000814',
                    light: '#001D3D',
                },
                surface: {
                    DEFAULT: '#003566',
                    light: '#034078',
                },
            },
        },
    },
    plugins: [],
};
