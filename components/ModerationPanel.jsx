'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveStory, lockModeration, rejectStory } from '@/app/actions';
import { tagClass, timeAgo } from '@/lib/format';

// Admin backend: pending stories with Approve / Reject. Approving moves a
// story to the public wall; rejecting deletes it from the JSON store.
export default function ModerationPanel({ stories }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [, startTransition] = useTransition();

  const list = Array.isArray(stories) ? stories : [];
  const empty = list.length === 0;

  function handle(storyId, action) {
    startTransition(async () => {
      const result = action === 'approve' ? await approveStory(storyId) : await rejectStory(storyId);
      setMessage(result?.message || '');
      router.refresh(); // pick up the revalidated server component props
    });
  }

  return (
    <div className="mod-panel">
      <p className="mod-count" role="status" aria-live="polite">
        {message ||
          (empty
            ? 'No stories are waiting for review.'
            : `${list.length} ${list.length === 1 ? 'story is' : 'stories are'} waiting for review.`)}
      </p>

      {empty ? (
        <div className="empty-state is-small">
          <p className="empty-title">Nothing is waiting for review. The queue is clear.</p>
        </div>
      ) : (
        <ul className="pending-list">
          {list.map((story) => (
            <li className="pending-card" key={story.id}>
              <div className="pending-meta">
                <span className={tagClass(story.category)}>{story.category}</span>
                <span>{story.author || 'Anonymous'}</span>
                <time dateTime={new Date(story.createdAt).toISOString()}>
                  {timeAgo(story.createdAt)}
                </time>
              </div>

              <p className="pending-text">{story.text}</p>

              <div className="pending-actions">
                <button
                  type="button"
                  className="btn btn-approve"
                  aria-label={`Approve story: ${story.text.slice(0, 60)}`}
                  onClick={() => handle(story.id, 'approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-reject"
                  aria-label={`Reject and delete story: ${story.text.slice(0, 60)}`}
                  onClick={() => handle(story.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setMessage('Signing out of the panel…');
            startTransition(async () => {
              await lockModeration();
              router.refresh();
            });
          }}
        >
          Lock the panel
        </button>
      </p>
    </div>
  );
}
