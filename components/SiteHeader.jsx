'use client';

import { useEffect, useState } from 'react';
import ShareDialog from './ShareDialog';

// The header owns the share dialog so the trigger button and the dialog live
// in the same client tree. Other parts of the page (for example the empty
// state on the wall) ask for the dialog by dispatching a small event.
export const OPEN_SHARE_EVENT = 'swoh:open-share';

export function requestShareDialog() {
  window.dispatchEvent(new CustomEvent(OPEN_SHARE_EVENT));
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SHARE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SHARE_EVENT, onOpen);
  }, []);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <p className="eyebrow">From Preparedness to Humanity &ndash; Building Resilient Communities</p>
        <h1 className="site-title">Story Wall of Hope</h1>
        <p className="tagline">Every story is a light in the dark</p>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => setOpen(true)}
        >
          Share Your Story
        </button>
      </div>

      <ShareDialog open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
