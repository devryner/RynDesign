import type { WebSocketServer } from 'ws';
import { watch } from 'chokidar';
import type { IncrementalBuilder } from './incremental-build.js';

export function setupWatcher(
  builder: IncrementalBuilder,
  wss: WebSocketServer,
  cwd: string
): void {
  const watcher = watch(
    ['tokens/**/*.tokens.json', 'components/**/*.component.json'],
    {
      cwd,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 50,
      },
    }
  );

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleChange = (changedPath: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      console.log(`File changed: ${changedPath}`);

      try {
        await builder.rebuild();

        // Broadcast to all connected clients
        const data = JSON.stringify({
          type: 'rebuild-complete',
          changedTokens: [],
          timestamp: Date.now(),
          tokenSet: builder.getTokenSet(),
          components: builder.getComponents(),
        });

        for (const client of wss.clients) {
          if (client.readyState === 1) {
            client.send(data);
          }
        }
      } catch (err) {
        console.error('Rebuild failed:', (err as Error).message);
      }
    }, 300);
  };

  watcher.on('change', handleChange);
  watcher.on('add', handleChange);
  watcher.on('unlink', handleChange);
}
