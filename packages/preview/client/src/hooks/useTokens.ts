import { useCallback } from 'react';

export function useTokens(send: (msg: Record<string, unknown>) => void) {
  const updateToken = useCallback((path: string, value: unknown, theme?: string) => {
    send({
      type: 'token-update',
      theme,
      path,
      value,
    });
  }, [send]);

  return { updateToken };
}
