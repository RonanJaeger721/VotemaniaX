'use client';

import { useEffect } from 'react';

const VERCEL_PROXY_HOST = 'votemania-x.vercel.app';
const APPLICATION_ORIGIN = 'https://votemania-live.ronanjaeger721.chatgpt.site';

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

    const submitAtApplicationOrigin = (event: SubmitEvent) => {
      if (window.location.hostname !== VERCEL_PROXY_HOST) return;
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.method.toLowerCase() === 'get') return;

      const action = new URL(form.action || window.location.href, window.location.href);
      if (action.origin !== window.location.origin) return;

      // Mutations must execute on the host that owns the D1-backed application
      // session. Otherwise the proxy receives the cookie and the application
      // cannot see it after the redirect (most visibly on admin sign-in).
      form.action = new URL(`${action.pathname}${action.search}`, APPLICATION_ORIGIN).href;
    };

    document.addEventListener('click', navigate, true);
    document.addEventListener('submit', submitAtApplicationOrigin, true);
    return () => {
      document.removeEventListener('click', navigate, true);
      document.removeEventListener('submit', submitAtApplicationOrigin, true);
    };
  }, []);
  return null;
}
