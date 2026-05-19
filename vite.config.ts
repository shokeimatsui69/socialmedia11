import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const readJsonBody = (req: any) => new Promise<any>((resolve, reject) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  Object.assign(process.env, env);
  return {
    plugins: [
      react(),
      {
        name: 'matrix-intelligence-api',
        configureServer(server) {
          server.middlewares.use('/api/intelligence/run', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const { runIntelligencePipeline } = await import('./server/intelligencePipeline');
              const result = await runIntelligencePipeline(body);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
            }
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
