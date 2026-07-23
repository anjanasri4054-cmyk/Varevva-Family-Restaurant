import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        specials: resolve(__dirname, 'specials.html'),
        menu: resolve(__dirname, 'menu.html'),
        item: resolve(__dirname, 'item.html'),
        ambience: resolve(__dirname, 'ambience.html'),
        contact: resolve(__dirname, 'contact.html'),
        verify: resolve(__dirname, 'verify.html'),
      },
    },
  },
});
