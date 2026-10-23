'use client';

import { useState, useTransition } from 'react';
import { reactToStory } from '@/app/actions';
import { CARD_TONES } from '@/lib/constants';
import { reactionText, tagClass, timeAgo } from '@/lib/format';

export default function StoryCard({ story }) {
  const [supports, setSupports] = useState(story.supports || 0);
  const [reacted, setReacted] = useState(Boolean(story.reacted));
  const [, startTransition] = useTransition();

  const tone = CARD_TONES[story.tone % CARD_TONES.length] || CARD_TONES[0];

  function handleReact() {
    if (reacted) return; // one reaction per visitor
    startTransition(async () => {
      const result = await reactToStory(story.id);
      if (result?.ok) {
        setSupports(result.supports);
        setReacted(true);
      }
    });
  }

  return (
    <li className="card" style={{ '--card-bg': tone }}>
      <article aria-labelledby={`title-${story.id}`}>
        <div className="card-top">
          <span className={tagClass(story.category)}>{story.category}</span>
          <time dateTime={new Date(story.createdAt).toISOString()}>{timeAgo(story.createdAt)}</time>
        </div>

        <p className="card-text" id={`title-${story.id}`}>
          {story.text}
        </p>

        <div className="card-foot">
          <span className="author">— {story.author || 'Anonymous'}</span>

          <div className="react-block">
            <button
              type="button"
              className="react-btn"
              aria-pressed={reacted ? 'true' : 'false'}
              aria-describedby={`count-${story.id}`}
              onClick={handleReact}
            >
              <svg
                className="heart"
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
                focusable="false"
              >
                {/* A heart resting in two cupped hands. */}
                <path
                  d="M12 6.6c1.25-2.5 4.95-2.05 5.55.55.4 1.75-1.25 3.4-3.3 4.75L12 13.6l-2.25-1.7C7.7 10.55 6.05 8.9 6.45 7.15c.6-2.6 4.3-3.05 5.55-.55z"
                  fill="currentColor"
                />
                <path
                  d="M3 14.2c1.7 3.6 5.1 5.9 9 5.9s7.3-2.3 9-5.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                <path
                  d="M3 14.2l-1.1 2.2M21 14.2l1.1 2.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
              <span>I’m with you</span>
            </button>

            <p className="react-count" id={`count-${story.id}`} role="status">
              {reactionText(supports)}
            </p>
          </div>
        </div>
      </article>
    </li>
  );
}
