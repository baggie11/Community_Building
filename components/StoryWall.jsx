'use client';

import { useMemo, useState } from 'react';
import StoryCard from './StoryCard';
import { requestShareDialog } from './SiteHeader';

const FILTERS = ['all', 'Received Help', 'Gave Help', 'Community'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'supported', label: 'Most supported' }
];

export default function StoryWall({ stories }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const visible = useMemo(() => {
    let list = Array.isArray(stories) ? stories : [];
    if (filter !== 'all') list = list.filter((s) => s.category === filter);

    return list
      .slice()
      .sort((a, b) => {
        if (sort === 'supported') {
          const diff = (b.supports || 0) - (a.supports || 0);
          if (diff !== 0) return diff;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [stories, filter, sort]);

  const isEmpty = visible.length === 0;

  return (
    <section className="wall-section wrap" aria-labelledby="wallHeading">
      <div className="wall-head">
        <h2 id="wallHeading">Stories on the wall</h2>
        <p className="wall-sub">
          Short, anonymous accounts of help given and received. Nothing personal is ever published.
        </p>
      </div>

      <div className="controls">
        <div className="control-group" role="group" aria-labelledby="filterLabel">
          <span className="control-label" id="filterLabel">
            Filter
          </span>
          <div className="chip-row">
            {FILTERS.map((value) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={'chip' + (active ? ' is-active' : '')}
                  aria-pressed={active}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? 'All' : value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="control-group" role="group" aria-labelledby="sortLabel">
          <span className="control-label" id="sortLabel">
            Sort
          </span>
          <div className="chip-row">
            {SORTS.map((option) => {
              const active = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={'chip' + (active ? ' is-active' : '')}
                  aria-pressed={active}
                  onClick={() => setSort(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {isEmpty
          ? 'No stories match the current filter.'
          : `Showing ${visible.length} ${visible.length === 1 ? 'story' : 'stories'}`}
      </p>

      {isEmpty ? (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">
            ❂
          </span>
          <p className="empty-title">Be the first to share a story of hope.</p>
          <button type="button" className="btn btn-primary" onClick={requestShareDialog}>
            Share Your Story
          </button>
        </div>
      ) : (
        <ul className="story-grid">
          {visible.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </ul>
      )}
    </section>
  );
}
