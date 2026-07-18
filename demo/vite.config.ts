import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point imports from the library source directly for HMR during dev
      '@pushkar/ghost-text': path.resolve(__dirname, '../src/index.ts'),
    },
  },
});
