import { useEffect } from 'react';
import { Platform } from 'react-native';

// Keyframes used across the web UI. The production build injects these via
// scripts/post-build.js, but the dev server (metro) doesn't run that step —
// this component makes the same animations available at runtime everywhere.
const CSS = `
@keyframes status-pulse {
  0% { transform: scale(0.85); opacity: 0.6; }
  50% { transform: scale(1.45); opacity: 0.2; }
  100% { transform: scale(0.85); opacity: 0.6; }
}
.status-pulse-anim {
  animation: status-pulse 2s infinite ease-in-out;
}
@keyframes dr-ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.dr-ticker-track {
  display: flex;
  flex-direction: row;
  width: max-content;
  animation: dr-ticker 36s linear infinite;
  will-change: transform;
}
.dr-ticker-track:hover {
  animation-play-state: paused;
}
@keyframes dr-fade-up {
  0% { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}
.dr-fade-up {
  animation: dr-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;

export function GlobalWebStyles() {
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') return;
        if (document.getElementById('datariot-global-anim')) return;
        const style = document.createElement('style');
        style.id = 'datariot-global-anim';
        style.textContent = CSS;
        document.head.appendChild(style);
    }, []);
    return null;
}
