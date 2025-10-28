export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'Android >= 5',
        'Chrome >= 60',
      ],
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
  },
};