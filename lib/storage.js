// -----------------------------------------------------------------------------
// JSON-file data store. Everything the wall writes lives in /data/stories.json.
// This is deliberately simple: one JSON array, read and written from Next.js
// Server Actions. For a larger deployment swap this module for a database —
// the exported functions are the only place that knows about the file.
// -----------------------------------------------------------------------------
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { seedStories } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
export const DATA_FILE = path.join(DATA_DIR, 'stories.json');

// Serialise writes so two concurrent requests cannot interleave and corrupt
// the file. Good enough for a demo; a real database would handle this for you.
let writeQueue = Promise.resolve();

async function readStoriesFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[storage] could not read data/stories.json:', err);
    }
    return null;
  }
}

export function writeStories(list) {
  const job = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
    await fs.rename(tmp, DATA_FILE); // atomic on the same volume
  });
  writeQueue = job.catch((err) => console.error('[storage] write failed:', err));
  return job;
}

/** All stories, seeding the file the first time it is missing or empty. */
export async function readStories() {
  let list = await readStoriesFile();
  if (!list || list.length === 0) {
    list = seedStories();
    await writeStories(list);
  }
  return list;
}

export async function approvedStories() {
  const list = await readStories();
  return list
    .filter((s) => s.status === 'approved')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function pendingStories() {
  const list = await readStories();
  return list
    .filter((s) => s.status === 'pending')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function addStory(story) {
  const list = await readStories();
  list.unshift(story);
  await writeStories(list);
  return story;
}

export async function updateStory(id, patch) {
  const list = await readStories();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch };
  await writeStories(list);
  return list[index];
}

export async function deleteStory(id) {
  const list = await readStories();
  const next = list.filter((s) => s.id !== id);
  await writeStories(next);
  return next.length !== list.length;
}

/** Mutates the stored list in place — used by the reaction counter. */
export async function mutateStories(mutator) {
  const list = await readStories();
  const result = mutator(list);
  await writeStories(list);
  return result;
}
