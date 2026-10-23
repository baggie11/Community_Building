# Story Wall of Hope

A single-page site for the student humanitarian project **“From Preparedness to Humanity – Building Resilient Communities”**: an anonymous wall where people share short stories of help they gave or received during a crisis.

Built with **Next.js (App Router)**, **Server Actions** as the backend, and a plain **JSON file** as the database.

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

- Public wall: <http://localhost:3000>
- Admin backend: <http://localhost:3000/moderate> — passcode `hope2026` (override with the `MOD_PASSCODE` environment variable, see `.env.local.example`).

## How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| JSON store | `data/stories.json` | Created and seeded automatically on first run. Delete the file to reseed. |
| Storage helpers | `lib/storage.js` | Reads/writes the JSON file, serialising writes so requests cannot corrupt it. |
| Backend | `app/actions.js` | Server Actions: submit, react, approve, reject, unlock/lock the panel. Validation and the content filter run here, so they cannot be bypassed from the browser. |
| Content filter | `lib/filter.js` | Blocks phone numbers, emails and a sample banned-word list. Extend `BANNED_WORDS` to add more. |
| Admin backend | `app/moderate/page.jsx` | Passcode gate → session cookie → pending queue with Approve / Reject. |
| UI | `app/layout.jsx`, `app/page.jsx`, `components/*` | Warm dawn palette, Montserrat headings, Inter body text, responsive CSS Grid. |

## Data model (`data/stories.json`)

```json
{
  "id": "8f0c…",
  "category": "Received Help",
  "text": "During the floods our neighbour shared his boat…",
  "author": "Anonymous",
  "createdAt": 1760000000000,
  "approvedAt": 1760000100000,
  "status": "pending",
  "tone": 2,
  "supports": 0,
  "reactedBy": []
}
```

- `status` is `pending` until a moderator approves it; rejected stories are deleted.
- `tone` picks one of 5 warm pastel card colours.
- `reactedBy` holds visitor ids (from an httpOnly cookie) so “I'm with you” counts once per person.

## Features

- Share form in an accessible modal: 30–400 characters with a live counter, category dropdown, optional first name (Anonymous by default), and a required truthfulness/privacy confirmation.
- Automatic filter before saving: phone numbers, emails and banned words are blocked with a friendly message.
- Moderation panel at `/moderate`: approve → story appears on the wall; reject → story is deleted.
- “I'm with you” reactions with a heart-hands icon, counted once per visitor.
- Filter by category, sort by newest or most supported.
- Warm empty state: “Be the first to share a story of hope.”
- Accessibility: semantic HTML, labels for every input, keyboard-navigable modal and buttons, `aria-live` regions for form and wall updates, skip link, visible focus rings, AA-contrast palette.
- Six sample approved stories are seeded on first run (`lib/seed.js`) so the wall looks alive — they are clearly marked as examples.

## Notes for a real deployment

The JSON file is a deliberate simplification for a first version. Before going public you would: move the store to a database, replace the passcode gate with real authentication, store the banned-word list in config, add rate limiting and reports, and host the moderation actions behind an admin role.
