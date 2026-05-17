// PostCSS loads the Tailwind CSS v4 plugin for global styles and utility classes.
const config = {
  plugins: {
    // Tailwind transforms @import "tailwindcss" and utility usage during builds.
    "@tailwindcss/postcss": {},
  },
};

export default config;
