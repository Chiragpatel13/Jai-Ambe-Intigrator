'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
