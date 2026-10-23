// -----------------------------------------------------------------------------
// AUTOMATIC CONTENT FILTER + form validation.
//
// Safety net that runs on the server before anything is written to the store:
// phone-number patterns, email addresses and a short sample list of banned
// words.
//
// To extend the filter, add lowercase words or phrases to BANNED_WORDS below
// (matching is case-insensitive and works on whole words/phrases). For a real
// deployment move this list out of the code into config, and add stronger
// checks: link shorteners, spam heuristics, a profanity API, moderator
// reports and rate limiting.
// -----------------------------------------------------------------------------
import { MAX_LEN, MIN_LEN, CATEGORIES } from './constants';

export const BANNED_WORDS = [
  'password',
  'credit card',
  'bank account',
  'id number',
  'passport',
  'social security',
  'click here',
  'free money',
  'lottery',
  'crypto wallet',
  'scam'
];

// Phone numbers: 7+ digits, optionally spaced, dashed or bracketed.
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d[\d\s.-]{6,}\d/;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

/** Returns the first rule the text breaks, or null when it is clean. */
export function findViolation(text) {
  if (PHONE_RE.test(text) && (text.match(/\d/g) || []).length >= 7) {
    return {
      type: 'contact',
      message:
        'It looks like your story contains a phone number. Please remove it and try again — the wall must stay anonymous.'
    };
  }

  if (EMAIL_RE.test(text)) {
    return {
      type: 'contact',
      message:
        'It looks like your story contains an email address. Please remove it and try again — the wall must stay anonymous.'
    };
  }

  const lower = ' ' + text.toLowerCase().replace(/[^\w\s]/g, ' ') + ' ';
  for (const word of BANNED_WORDS) {
    const needle = ' ' + word.replace(/[^\w\s]/g, ' ').trim().replace(/\s+/g, ' ') + ' ';
    if (lower.indexOf(needle) !== -1) {
      return {
        type: 'banned',
        message: 'Some words in your story are not allowed on the wall. Please rephrase it and try again.'
      };
    }
  }

  return null;
}

/**
 * Validates the shared fields. Returns an object like { text: 'message' } —
 * an empty object means everything is fine.
 */
export function validateStory({ text, category, firstName, confirm }) {
  const errors = {};

  if (!text) {
    errors.text = 'Please write your story before submitting.';
  } else if (text.length < MIN_LEN) {
    errors.text = `Your story is a little short — at least ${MIN_LEN} characters, please.`;
  } else if (text.length > MAX_LEN) {
    errors.text = `Your story is too long — please keep it to ${MAX_LEN} characters.`;
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = 'Please choose a category.';
  }

  if (firstName && !/^[\p{L} '-]{1,30}$/u.test(firstName)) {
    errors.firstName = 'First name only, please — letters up to 30 characters.';
  }

  if (!confirm) {
    errors.confirm = 'Please confirm the statement before submitting.';
  }

  return errors;
}
