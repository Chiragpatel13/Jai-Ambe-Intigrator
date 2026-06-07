'use client';

import { useEffect, useRef } from 'react';
import { LIVE_SYNC_EVENT, LIVE_SYNC_CHANNEL } from '@/lib/liveSync';

/**
 * Re-fetch client data on admin changes (instant) and on a timer (background).
 * @param {() => void} onSync - callback to reload data
 * @param {string[]} scopes - which update types trigger sync ('all' catches everything)
 * @param {number} intervalMs - background poll interval (0 = disabled)
 */
export function useLiveSync(onSync, scopes = ['all'], intervalMs = 12000) {
  const callbackRef = useRef(onSync);
  callbackRef.current = onSync;

  const scopesKey = scopes.join(',');

  useEffect(() => {
    const runIfMatch = (detail) => {
      const scope = detail?.scope || 'all';
      if (scopes.includes('all') || scopes.includes(scope)) {
        callbackRef.current();
      }
    };

    const onEvent = (e) => runIfMatch(e.detail);

    window.addEventListener(LIVE_SYNC_EVENT, onEvent);

    let ch;
    try {
      ch = new BroadcastChannel(LIVE_SYNC_CHANNEL);
      ch.onmessage = (e) => runIfMatch(e.data);
    } catch {}

    // Legacy channel support
    let settingsCh;
    let productsCh;
    try {
      if (scopes.includes('all') || scopes.includes('settings')) {
        settingsCh = new BroadcastChannel('settings_channel');
        settingsCh.onmessage = (e) => {
          if (e.data?.type === 'SETTINGS_UPDATED') callbackRef.current();
        };
      }
      if (scopes.includes('all') || scopes.includes('products')) {
        productsCh = new BroadcastChannel('products_channel');
        productsCh.onmessage = (e) => {
          if (e.data?.type === 'PRODUCTS_UPDATED') callbackRef.current();
        };
      }
    } catch {}

    const interval =
      intervalMs > 0
        ? setInterval(() => callbackRef.current(), intervalMs)
        : null;

    return () => {
      window.removeEventListener(LIVE_SYNC_EVENT, onEvent);
      try {
        ch?.close();
        settingsCh?.close();
        productsCh?.close();
      } catch {}
      if (interval) clearInterval(interval);
    };
  }, [scopesKey, intervalMs]);
}
