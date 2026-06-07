export const LIVE_SYNC_EVENT = 'ja:live-sync';
export const LIVE_SYNC_CHANNEL = 'ja_live_sync';

/** Notify all open client tabs/pages to refresh live data. */
export function notifyLiveSync(scope = 'all') {
  if (typeof window === 'undefined') return;

  const payload = { scope, at: Date.now() };

  window.dispatchEvent(new CustomEvent(LIVE_SYNC_EVENT, { detail: payload }));

  try {
    const ch = new BroadcastChannel(LIVE_SYNC_CHANNEL);
    ch.postMessage(payload);
    ch.close();
  } catch {
    // BroadcastChannel unavailable — CustomEvent still works in same tab
  }

  // Legacy channels for pages not yet migrated
  try {
    if (scope === 'settings' || scope === 'all') {
      const s = new BroadcastChannel('settings_channel');
      s.postMessage({ type: 'SETTINGS_UPDATED' });
      s.close();
    }
    if (scope === 'products' || scope === 'all') {
      const p = new BroadcastChannel('products_channel');
      p.postMessage({ type: 'PRODUCTS_UPDATED' });
      p.close();
    }
  } catch {}
}
