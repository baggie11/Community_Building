// Small formatting helpers shared by server and client code.

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
  const days = Math.floor(hours / 24);
  if (days < 7) return days + (days === 1 ? ' day ago' : ' days ago');
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function reactionText(n) {
  if (!n || n <= 0) return 'Be the first to say “I’m with you.”';
  if (n === 1) return '1 person is with you.';
  return n + ' people are with you.';
}

export function tagClass(category) {
  if (category === 'Received Help') return 'tag tag-received';
  if (category === 'Gave Help') return 'tag tag-gave';
  return 'tag tag-community';
}
