import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function eaiiPowerGuardStatusPlugin(): Plugin {
  let suiteActive = false;
  return {
    name: 'eaii-power-guard-status',
    configureServer(server) {
      server.middlewares.use('/__eaii/suite-status', (req, res, next) => {
        if (req.method === 'GET') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ active: suiteActive, updatedAt: Date.now() }));
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try { suiteActive = !!JSON.parse(body || '{}').active; } catch { suiteActive = false; }
            res.statusCode = 204;
            res.end();
          });
          return;
        }
        next();
      });

    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), eaiiPowerGuardStatusPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
    },
    esbuild: {
      target: 'esnext',
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
