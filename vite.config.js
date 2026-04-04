import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-slick', 'slick-carousel'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/all-doctors': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/all-students': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
