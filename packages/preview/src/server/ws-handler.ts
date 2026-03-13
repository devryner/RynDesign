import type { WebSocketServer, WebSocket } from 'ws';
import type { IncrementalBuilder } from './incremental-build.js';

export interface WsMessage {
  type: string;
  [key: string]: unknown;
}

export interface TokenUpdateMessage extends WsMessage {
  type: 'token-update';
  theme?: string;
  path: string;
  value: unknown;
}

export interface ThemeChangeMessage extends WsMessage {
  type: 'theme-change';
  theme: string;
}

export interface RebuildCompleteMessage extends WsMessage {
  type: 'rebuild-complete';
  changedTokens: string[];
  timestamp: number;
}

export function setupWsHandler(wss: WebSocketServer, builder: IncrementalBuilder): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('Preview client connected');

    // Send initial state
    ws.send(JSON.stringify({
      type: 'init',
      tokenSet: builder.getTokenSet(),
      themes: builder.getThemes(),
      components: builder.getComponents(),
    }));

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WsMessage;

        switch (message.type) {
          case 'token-update': {
            const update = message as TokenUpdateMessage;
            await builder.updateToken(update.path, update.value, update.theme);

            // Broadcast rebuild complete to all clients
            broadcast(wss, {
              type: 'rebuild-complete',
              changedTokens: [update.path],
              timestamp: Date.now(),
            });
            break;
          }

          case 'theme-change': {
            const themeMsg = message as ThemeChangeMessage;
            broadcast(wss, {
              type: 'theme-switched',
              theme: themeMsg.theme,
              tokens: builder.getThemeTokens(themeMsg.theme),
            });
            break;
          }

          case 'request-state': {
            ws.send(JSON.stringify({
              type: 'full-state',
              tokenSet: builder.getTokenSet(),
              themes: builder.getThemes(),
              components: builder.getComponents(),
            }));
            break;
          }
        }
      } catch (err) {
        ws.send(JSON.stringify({
          type: 'error',
          message: (err as Error).message,
        }));
      }
    });

    ws.on('close', () => {
      console.log('Preview client disconnected');
    });
  });
}

function broadcast(wss: WebSocketServer, message: Record<string, unknown>): void {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  }
}
