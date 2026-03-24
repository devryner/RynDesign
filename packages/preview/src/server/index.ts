import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { setupApiRoutes } from './api-routes.js';
import { setupWsHandler } from './ws-handler.js';
import { setupWatcher } from './watcher.js';
import { IncrementalBuilder } from './incremental-build.js';

export interface PreviewServerOptions {
  port?: number;
  open?: boolean;
  configPath?: string;
}

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

function killProcessOnPort(port: number): boolean {
  try {
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const pid = result.trim().split(/\s+/).pop();
      if (pid) {
        execSync(`taskkill /PID ${pid} /F`);
        return true;
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'pipe' });
      return true;
    }
  } catch {
    // No process found or kill failed
  }
  return false;
}

export async function startPreviewServer(options: PreviewServerOptions = {}): Promise<void> {
  const port = options.port ?? 4400;
  const cwd = process.cwd();

  // Check if port is in use
  if (await isPortInUse(port)) {
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;

    if (isTTY) {
      const readline = await import('node:readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>((resolve) => {
        rl.question(`\n  Port ${port} is already in use. Kill the existing process and restart? (y/N) `, resolve);
      });
      rl.close();

      if (answer.toLowerCase() === 'y') {
        if (killProcessOnPort(port)) {
          console.log(`  Killed process on port ${port}.`);
          await new Promise(r => setTimeout(r, 500));
        } else {
          console.error(`  Could not kill process on port ${port}.`);
          process.exit(1);
        }
      } else {
        console.log('  Aborted.');
        process.exit(0);
      }
    } else {
      console.error(`\n  Port ${port} is already in use. Use --port to specify a different port.`);
      process.exit(1);
    }
  }

  // Initialize incremental builder
  const builder = new IncrementalBuilder(cwd, options.configPath);
  await builder.initialBuild();

  // Create HTTP server
  const server = http.createServer();

  // Setup preview WebSocket in noServer mode to avoid Vite HMR conflict
  const wss = new WebSocketServer({ noServer: true });
  setupWsHandler(wss, builder);

  // Create Vite dev server for client SPA
  let reactPlugin;
  try {
    const mod = await import('@vitejs/plugin-react');
    reactPlugin = (mod.default ?? mod)();
  } catch {
    // Plugin not available, proceed without it
  }

  const vite = await createViteServer({
    root: path.resolve(__dirname, '../client'),
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    plugins: reactPlugin ? [reactPlugin] : [],
    appType: 'spa',
  });

  // Route WebSocket upgrades: /ws → preview, everything else → Vite HMR
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
    // Other upgrade requests (Vite HMR) are handled by Vite automatically
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
    console.log(`  ➜ WS:      ws://localhost:${port}/ws\n`);

    if (options.open) {
      import('child_process').then(cp => {
        const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        cp.exec(`${cmd} http://localhost:${port}/`);
      }).catch(() => {});
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
