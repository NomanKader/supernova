// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   base: './',
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//   },
//   server: {
//     port: Number(process.env.VITE_PORT) || 3000,
//     host: 'localhost',
//   },
//   preview: {
//     port: Number(process.env.VITE_PORT) || 3000,
//     host: 'localhost',
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/', // ✅ REQUIRED for root domain
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: Number(process.env.VITE_PORT) || 3000,
    host: true,
  },
  preview: {
    port: Number(process.env.VITE_PORT) || 3000,
    host: true,
  },
})
