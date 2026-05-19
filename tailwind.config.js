/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#040404",
          panel: "#0B0F0B",
          text: "#D8FFE4",
          green: "#00FF66",
          amber: "#FFB020",
          red: "#FF4D4D",
          border: "rgba(0, 255, 102, 0.18)",
          'border-active': "rgba(0, 255, 102, 0.55)",
        },
      },
      fontFamily: {
        sans: ['IBM Plex Mono', 'monospace'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
