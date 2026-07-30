/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#f8fafc',          // Crisp Light Slate Background
          card: '#ffffff',        // Pure White Cards
          cardBorder: '#e2e8f0',  // Light Border
          textMain: '#0f172a',    // Dark Slate Header Text
          textMuted: '#64748b',   // Muted Subtitle Text
          indigo: '#1e1b4b',      // Deep Indigo
          brand: '#0284c7',       // Sky Blue Primary
          accent: '#4f46e5',      // Electric Indigo Accent
          success: '#059669',     // Emerald
          warning: '#d97706',     // Amber
          danger: '#dc2626',      // Red Alert
          critical: '#991b1b'     // Dark Red Critical
        }
      }
    },
  },
  plugins: [],
}
