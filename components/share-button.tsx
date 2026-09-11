'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
export function ShareButton({ title }: { title: string }) {
  const [label, setLabel] = useState('Share');
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share)
        await navigator.share({
          title,
          text: `Support ${title} on VoteManiaX.`,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setLabel('Link copied');
        setTimeout(() => setLabel('Share'), 1800);
      }
    } catch {}
  }
  return (
    <button className="share-button" type="button" onClick={share}>
      <Share2 size={17} />
      {label}
    </button>
  );
}
