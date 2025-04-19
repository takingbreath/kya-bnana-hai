const path = require('path');

module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions = {
          plugins: [
            require('@tailwindcss/postcss7-compat'),
            require('autoprefixer'),
          ],
        };
        return postcssLoaderOptions;
      },
    },
  },
}; 