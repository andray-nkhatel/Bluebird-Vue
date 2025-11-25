import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
         // Include jQuery to ensure proper loading
        include: ['jquery']
    },
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
     // Define global variables for external libraries
  define: {
    global: 'globalThis',
  },
  // Proxy configuration to bypass CORS issues (works for both dev and preview)
  // The proxy forwards /api/* requests to the backend server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5287',  // Local backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
          });
        }
      }
    }
  },
  // Preview server also needs proxy for local testing of production build
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:5287',  // Local backend
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Preview proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Preview proxying:', req.method, req.url, '->', proxyReq.path);
          });
        }
      }
    }
  },
  // Ensure external scripts load properly
  build: {
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: 'jQuery'
        }
      }
    }
  }
});
