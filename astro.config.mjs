import { defineConfig } from 'astro/config';

// User site on a custom domain. GitHub Pages serves the built `dist/` from the domain root.
export default defineConfig({
  site: 'https://www.lisongtao.eu.org',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
