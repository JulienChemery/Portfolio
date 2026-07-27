import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Set by the Pages workflow to /<repo>/. Stays '/' for dev and for a
  // user-site deploy. All public/ paths go through asset() in lib/utils.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // The two animation libraries and React are most of the bundle and they
        // change only when a dependency is bumped. Splitting them off means a
        // copy edit reships a few KB of app code instead of half a megabyte,
        // and returning visitors keep the vendor chunks from cache.
        // Order matters: framer-motion's own deps are matched before the
        // catch-all 'react' test, which would otherwise swallow react-dom too.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'motion';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('react')) return 'react';
        },
      },
    },
  },
});
