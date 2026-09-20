import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-container": "#552100",
        "on-error": "#ffefee",
        "on-error-container": "#570008",
        "surface-dim": "#cad2ff",
        "on-secondary-fixed-variant": "#3f6600",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#002a61",
        "surface-bright": "#f7f5ff",
        "surface": "#f7f5ff",
        "on-tertiary": "#fff0e9",
        "on-surface": "#232c51",
        "on-tertiary-fixed-variant": "#632800",
        "error": "#b31b25",
        "secondary": "#3f6600",
        "secondary-dim": "#365900",
        "secondary-fixed": "#acf847",
        "surface-container-lowest": "#ffffff",
        "inverse-primary": "#6197fb",
        "primary": "#ea580c",
        "on-primary-container": "#00214f",
        "outline-variant": "#a2abd7",
        "on-secondary-container": "#375b00",
        "tertiary": "#994100",
        "on-secondary": "#daffa9",
        "surface-container-high": "#dde1ff",
        "error-container": "#fb5151",
        "outline": "#6c759e",
        "tertiary-fixed-dim": "#ff7f2f",
        "primary-container": "#f97316",
        "on-primary": "#ffffff",
        "secondary-fixed-dim": "#9ee939",
        "on-tertiary-fixed": "#2e0e00",
        "error-dim": "#9f0519",
        "on-surface-variant": "#515981",
        "surface-container": "#e4e7ff",
        "tertiary-fixed": "#ff955a",
        "primary-dim": "#c2410c",
        "secondary-container": "#acf847",
        "surface-container-highest": "#d5dbff",
        "surface-container-low": "#efefff",
        "inverse-surface": "#020a2f",
        "tertiary-container": "#ff955a",
        "background": "#f7f5ff",
        "tertiary-dim": "#863800",
        "surface-variant": "#d5dbff",
        "on-background": "#232c51",
        "primary-fixed": "#6d9fff",
        "primary-fixed-dim": "#5b92f5",
        "on-secondary-fixed": "#2a4700",
        "surface-tint": "#0d58b8",
        "inverse-on-surface": "#929bc6"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "sans": ["Plus Jakarta Sans", "sans-serif"],
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Plus Jakarta Sans", "sans-serif"],
        "label": ["Plus Jakarta Sans", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
