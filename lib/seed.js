// -----------------------------------------------------------------------------
// SEED DATA — 6 sample APPROVED stories so the wall looks alive on first load.
// They are clearly examples, not real submissions. Delete this block (or just
// remove /data/stories.json) to regenerate, or empty the file and edit it by
// hand — the store reseeds whenever the file is missing or empty.
// -----------------------------------------------------------------------------
import { CATEGORIES } from './constants';

const HOUR = 60 * 60 * 1000;

const SAMPLES = [
  {
    category: 'Received Help',
    text: 'During the floods our neighbour shared his boat and rowed us to the school shelter. He did not know us, but he made sure every child on our street was dry and warm.',
    author: 'Anonymous',
    ageMs: 3 * HOUR,
    tone: 0,
    supports: 12
  },
  {
    category: 'Gave Help',
    text: 'When the power went out for three days I charged my neighbours phones from a small solar panel on my balcony. Twenty minutes each, sorted by who needed it most.',
    author: 'Ravi',
    ageMs: 9 * HOUR,
    tone: 2,
    supports: 8
  },
  {
    category: 'Community',
    text: 'Our students set up a free water station at the bus stand every summer. Last year it served more than four hundred people a day, all of it run by volunteers.',
    author: 'Anonymous',
    ageMs: 26 * HOUR,
    tone: 4,
    supports: 21
  },
  {
    category: 'Received Help',
    text: 'A stranger at the chemist paid for my fathers medicine when I realised I had left my wallet at home. I never caught her name, only her smile.',
    author: 'Meera',
    ageMs: 2 * 24 * HOUR,
    tone: 1,
    supports: 15
  },
  {
    category: 'Gave Help',
    text: 'After the earthquake drill I sat with my aunt and built her a simple emergency kit: water, torch, radio, and a list of neighbours who can drive.',
    author: 'Anonymous',
    ageMs: 3 * 24 * HOUR,
    tone: 3,
    supports: 6
  },
  {
    category: 'Community',
    text: 'After the storm the bakery on our corner gave away every loaf for free rather than let it go stale. The queue was long and nobody complained once.',
    author: 'Jonah',
    ageMs: 5 * 24 * HOUR,
    tone: 2,
    supports: 18
  }
];

export function seedStories() {
  const now = Date.now();
  return SAMPLES.map((sample, index) => ({
    id: 'seed-' + (index + 1),
    category: CATEGORIES.includes(sample.category) ? sample.category : 'Community',
    text: sample.text,
    author: sample.author || 'Anonymous',
    createdAt: now - sample.ageMs,
    approvedAt: now - sample.ageMs,
    status: 'approved',
    tone: sample.tone,
    supports: sample.supports,
    reactedBy: []
  }));
}
