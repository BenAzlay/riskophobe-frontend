export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        nimbus: ['Nimbus', 'serif']
      }
    },
  },
  plugins: [require("daisyui")],
}
