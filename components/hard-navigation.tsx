'use client';

import { useEffect } from 'react';

/**
 * The public Vercel URL proxies the application from its Sites origin. Vinext's
 * client router can cancel a click before the rewritten RSC request completes.
 * Use ordinary same-origin document navigation at that boundary so every link
 * remains dependable on touch devices and behind the proxy.
 */
export function HardNavigation() {
  useEffect(() => {
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.download) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash && url.pathname === window.location.pathname) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(url.href);
    };
    document.addEventListener('click', navigate, true);
    return () => document.removeEventListener('click', navigate, true);
  }, []);
  return null;
}
