'use server';

// -----------------------------------------------------------------------------
// Server Actions — this is the app's backend. All reads and writes to the JSON
// store happen here, so the rules (validation, content filter, moderation
// rights) cannot be bypassed from the browser.
// -----------------------------------------------------------------------------
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import {
  addStory,
  deleteStory,
  mutateStories,
  readStories,
  updateStory
} from '@/lib/storage';
import { findViolation, validateStory } from '@/lib/filter';
import { checkPasscode, isModUnlocked, setModUnlocked } from '@/lib/moderation';
import { CATEGORIES, VISITOR_COOKIE } from '@/lib/constants';
import { uid } from '@/lib/format';

/* --------------------------------- visitors -------------------------------- */

/** Read-only: safe inside a Server Component (pages). */
async function readVisitorId() {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value || null;
}

/** Writes the cookie when a visitor has none — Server Actions only. */
async function getVisitorId() {
  const existing = await readVisitorId();
  if (existing) return existing;

  const store = await cookies();
  const id = uid();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  });
  return id;
}

/* ---------------------------------- stories -------------------------------- */

/**
 * Share form action (used with useActionState).
 * Creates a story with status "pending" — it never reaches the public wall
 * until a moderator approves it.
 */
export async function submitStory(prevState, formData) {
  const fields = {
    text: String(formData.get('text') || '').trim(),
    category: String(formData.get('category') || ''),
    firstName: String(formData.get('firstName') || '').trim(),
    confirm: formData.get('confirm') === 'on'
  };

  const errors = validateStory(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please check the highlighted fields and try again.', errors };
  }

  // Automatic filter: phone numbers, emails, banned words.
  const violation = findViolation(fields.text);
  if (violation) {
    return {
      ok: false,
      message: 'One moment — ' + violation.message + ' Nothing has been sent to a moderator yet.',
      errors: { text: violation.message }
    };
  }

  const now = Date.now();
  await addStory({
    id: uid(),
    category: CATEGORIES.includes(fields.category) ? fields.category : 'Community',
    text: fields.text,
    author: fields.firstName || 'Anonymous',
    createdAt: now,
    approvedAt: null,
    status: 'pending', // hidden until a moderator approves it
    tone: Math.floor(Math.random() * 5),
    supports: 0,
    reactedBy: []
  });

  revalidatePath('/');
  revalidatePath('/moderate');

  return {
    ok: true,
    message: 'Thank you. Your story will appear after a moderator reviews it.',
    errors: {}
  };
}

/**
 * "I'm with you" reaction — counts once per visitor. The visitor is identified
 * by an httpOnly cookie, so the count cannot be padded from the browser.
 */
export async function reactToStory(storyId) {
  const visitor = await getVisitorId();

  const result = await mutateStories((list) => {
    const story = list.find((s) => s.id === storyId && s.status === 'approved');
    if (!story) return { ok: false };

    const reactedBy = Array.isArray(story.reactedBy) ? story.reactedBy : [];
    if (reactedBy.includes(visitor)) {
      return { ok: true, already: true, supports: story.supports || 0 };
    }

    story.supports = (story.supports || 0) + 1;
    story.reactedBy = reactedBy.concat(visitor);
    return { ok: true, already: false, supports: story.supports };
  });

  revalidatePath('/');
  return result.ok ? result : { ok: false, message: 'This story is no longer on the wall.' };
}

/* -------------------------------- moderation ------------------------------- */

/** Admin backend: unlock the panel with the demo passcode. */
export async function unlockModeration(prevState, formData) {
  const value = String(formData.get('passcode') || '');
  if (!checkPasscode(value)) {
    return { ok: false, message: 'That passcode is not correct. Please try again.' };
  }

  await setModUnlocked(true);
  revalidatePath('/moderate');
  return { ok: true, message: 'Panel unlocked. You can review pending stories below.' };
}

export async function lockModeration() {
  await setModUnlocked(false);
  revalidatePath('/moderate');
}

/** Approve a pending story — it moves to the public wall. */
export async function approveStory(storyId) {
  if (!(await isModUnlocked())) return { ok: false, message: 'Please unlock the panel first.' };

  await updateStory(storyId, { status: 'approved', approvedAt: Date.now() });
  revalidatePath('/');
  revalidatePath('/moderate');
  return { ok: true, message: 'Story approved. It is now on the public wall.' };
}

/** Reject a pending story — it is deleted from the store. */
export async function rejectStory(storyId) {
  if (!(await isModUnlocked())) return { ok: false, message: 'Please unlock the panel first.' };

  await deleteStory(storyId);
  revalidatePath('/');
  revalidatePath('/moderate');
  return { ok: true, message: 'Story rejected and deleted.' };
}

/* --------------------------------- utilities ------------------------------- */

/** Server-side snapshot used by the wall page. */
export async function getPublicStories() {
  const visitor = await readVisitorId(); // read-only: this runs in a page
  const list = await readStories();
  return list
    .filter((s) => s.status === 'approved')
    .map((s) => ({
      id: s.id,
      category: s.category,
      text: s.text,
      author: s.author || 'Anonymous',
      createdAt: s.createdAt,
      tone: s.tone,
      supports: s.supports || 0,
      reacted: (s.reactedBy || []).includes(visitor)
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
