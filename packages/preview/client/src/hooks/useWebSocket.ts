import { useState, useEffect, useCallback, useRef } from 'react';

interface TokenSet {
  metadata: { name?: string; description?: string };
  tokens: any[];
  groups: any[];
  themes: { default: string; themes: Record<string, any> };
}

interface WsState {
  connected: boolean;
  tokenSet: TokenSet | null;
  components: any[];
  snippets: Record<string, string>;
}

export function useWebSocket() {
  const [state, setState] = useState<WsState>({
    connected: false,
    tokenSet: null,
    components: [],
    snippets: {},
  });
  const wsRef = useRef<WebSocket | null>(null);

  const send = useCallback((msg: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const requestSnippets = useCallback((platform: string, component: string) => {
    fetch(`/api/snippets?platform=${platform}&component=${component}`)
      .then(r => r.json())
      .then(data => {
        setState(prev => ({ ...prev, snippets: { ...prev.snippets, [`${platform}:${component}`]: data.code ?? '' } }));
      })
      .catch(() => {});

    fetch(`/api/snippets?platform=${platform}&type=tokens`)
      .then(r => r.json())
      .then(data => {
        setState(prev => ({ ...prev, snippets: { ...prev.snippets, [`${platform}:tokens`]: data.code ?? '' } }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function connect() {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${location.host}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({ ...prev, connected: true }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'init':
          case 'full-state':
            setState(prev => ({
              ...prev,
              tokenSet: msg.tokenSet,
              components: msg.components ?? prev.components,
            }));
            break;
          case 'rebuild-complete':
            if (msg.tokenSet) {
              setState(prev => ({
                ...prev,
                tokenSet: msg.tokenSet,
                components: msg.components ?? prev.components,
              }));
            }
            break;
        }
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, connected: false }));
        setTimeout(connect, 2000);
      };
    }

    connect();

    // Fallback: fetch initial data via REST
    fetch('/api/tokens').then(r => r.json()).then(data => {
      setState(prev => {
        if (prev.tokenSet) return prev;
        return { ...prev, tokenSet: data };
      });
    }).catch(() => {});

    fetch('/api/components').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setState(prev => ({ ...prev, components: data }));
      }
    }).catch(() => {});

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    connected: state.connected,
    tokenSet: state.tokenSet,
    components: state.components,
    snippets: state.snippets,
    send,
    requestSnippets,
  };
}
