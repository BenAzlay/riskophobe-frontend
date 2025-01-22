export default {
  mode: 'jit',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        nimbus: ['Nimbus', 'serif']
      }
    },
  },
  daisyui: {
    themes: [
      {
        riskophobe: {
          "primary": "#6B46C1", // Purple
          "primary-focus": "#553C9A",
          "secondary": "#9F7AEA", // Light Purple
          "accent": "#FBD38D", // Amber
          "neutral": "#1A202C", // Dark Gray
          "neutral-focus": "#2D3748",
          "base-100": "#121212", // Black
          "info": "#4299E1", // Blue
          "success": "#48BB78", // Green
          "warning": "#ECC94B", // Yellow
          "error": "#E53E3E", // Red
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}
