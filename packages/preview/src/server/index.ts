import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import path from 'node:path';
import { setupApiRoutes } from './api-routes.js';
import { setupWsHandler } from './ws-handler.js';
import { setupWatcher } from './watcher.js';
import { IncrementalBuilder } from './incremental-build.js';

export interface PreviewServerOptions {
  port?: number;
  open?: boolean;
  configPath?: string;
}

export async function startPreviewServer(options: PreviewServerOptions = {}): Promise<void> {
  const port = options.port ?? 4400;
  const cwd = process.cwd();

  // Initialize incremental builder
  const builder = new IncrementalBuilder(cwd, options.configPath);
  await builder.initialBuild();

  // Create HTTP server
  const server = http.createServer();

  // Setup WebSocket
  const wss = new WebSocketServer({ server });
  setupWsHandler(wss, builder);

  // Create Vite dev server for client SPA
  const vite = await createViteServer({
    root: path.resolve(__dirname, '../client'),
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: 'spa',
  });

  // Setup API routes
  const apiHandler = setupApiRoutes(builder);

  // Handle requests
  server.on('request', (req, res) => {
    if (req.url?.startsWith('/api/')) {
      apiHandler(req, res);
    } else {
      vite.middlewares(req, res);
    }
  });

  // Setup file watcher
  setupWatcher(builder, wss, cwd);

  // Start server
  server.listen(port, () => {
    console.log(`\n  🎨 RynDesign Preview`);
    console.log(`  ➜ Local:   http://localhost:${port}/`);
    console.log(`  ➜ WS:      ws://localhost:${port}/\n`);

    if (options.open) {
      import('open').then(m => m.default(`http://localhost:${port}/`)).catch(() => {});
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    wss.close();
    vite.close();
    server.close();
    process.exit(0);
  });
}
