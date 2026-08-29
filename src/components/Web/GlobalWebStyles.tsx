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
@keyframes dr-aurora-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 35px) scale(1.18); }
}
.dr-aurora {
  animation: dr-aurora-drift 16s ease-in-out infinite;
  will-change: transform;
}
.dr-aurora-slow {
  animation: dr-aurora-drift 26s ease-in-out infinite reverse;
  will-change: transform;
}
.dr-scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.028) 0px,
    rgba(255, 255, 255, 0.028) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
}
@keyframes dr-badge-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes dr-badge-glow {
  0%, 100% { box-shadow: 0 0 6px rgba(56, 189, 248, 0.25), inset 0 0 8px rgba(56, 189, 248, 0.06); }
  50% { box-shadow: 0 0 14px rgba(56, 189, 248, 0.45), inset 0 0 12px rgba(56, 189, 248, 0.12); }
}
@keyframes dr-badge-border-glow {
  0%, 100% { border-color: rgba(56, 189, 248, 0.5); }
  50% { border-color: rgba(56, 189, 248, 0.85); }
}
.dr-badge-premium {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 9, 13, 0.75) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(8, 9, 13, 0.75) 100%) !important;
  border: 1px solid rgba(56, 189, 248, 0.5) !important;
  border-radius: 6px !important;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  animation: dr-badge-glow 3s ease-in-out infinite, dr-badge-border-glow 3s ease-in-out infinite;
  overflow: hidden;
}
.dr-badge-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(56, 189, 248, 0.08) 35%,
    rgba(139, 92, 246, 0.06) 50%,
    rgba(56, 189, 248, 0.08) 65%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: dr-badge-shimmer 4s linear infinite;
  pointer-events: none;
  border-radius: inherit;
}
.dr-badge-premium::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.6) 30%, rgba(139, 92, 246, 0.4) 70%, transparent 100%);
  pointer-events: none;
}
.dr-badge-match {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 9, 13, 0.75) 0%, rgba(6, 30, 50, 0.8) 50%, rgba(8, 9, 13, 0.75) 100%) !important;
  border: 1px solid rgba(52, 211, 153, 0.5) !important;
  border-radius: 6px !important;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  overflow: hidden;
}
.dr-badge-match::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(52, 211, 153, 0.1) 35%,
    rgba(56, 189, 248, 0.06) 50%,
    rgba(52, 211, 153, 0.1) 65%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: dr-badge-shimmer 5s linear infinite;
  pointer-events: none;
  border-radius: inherit;
}
.dr-badge-match::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(52, 211, 153, 0.6) 30%, rgba(56, 189, 248, 0.4) 70%, transparent 100%);
  pointer-events: none;
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
