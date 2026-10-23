// Shared, non-secret constants. Safe to import from client components.

export const CATEGORIES = ['Received Help', 'Gave Help', 'Community'];

// 5 warm pastel card tones; a tone is picked at random when a story is created.
export const CARD_TONES = ['#FFF3D6', '#FDE2C8', '#FBD3B0', '#F8D8C8', '#FFE8C2'];

export const MIN_LEN = 30;
export const MAX_LEN = 400;

// Cookies: one identifies a visitor (so a reaction counts once per person),
// one keeps a moderator signed in for the current browser session.
export const VISITOR_COOKIE = 'swoh_visitor';
export const MOD_COOKIE = 'swoh_mod_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
