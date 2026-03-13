import type { IncomingMessage, ServerResponse } from 'node:http';
import type { IncrementalBuilder } from './incremental-build.js';

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

export function setupApiRoutes(builder: IncrementalBuilder): RequestHandler {
  return (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (pathname === '/api/tokens' && req.method === 'GET') {
        json(res, builder.getTokenSet());
      } else if (pathname === '/api/themes' && req.method === 'GET') {
        json(res, builder.getThemes());
      } else if (pathname === '/api/components' && req.method === 'GET') {
        json(res, builder.getComponents());
      } else if (pathname === '/api/tokens' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          const { path, value, theme } = JSON.parse(body);
          await builder.updateToken(path, value, theme);
          json(res, { success: true });
        });
      } else if (pathname === '/api/generated' && req.method === 'GET') {
        const platform = url.searchParams.get('platform');
        json(res, builder.getGeneratedFiles(platform ?? undefined));
      } else {
        res.writeHead(404);
        json(res, { error: 'Not found' });
      }
    } catch (err) {
      res.writeHead(500);
      json(res, { error: (err as Error).message });
    }
  };
}

function json(res: ServerResponse, data: unknown): void {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(data));
}
