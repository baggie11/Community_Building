import Link from 'next/link';

import ModerationGate from '@/components/ModerationGate';
import ModerationPanel from '@/components/ModerationPanel';
import { isModUnlocked } from '@/lib/moderation';
import { pendingStories } from '@/lib/storage';

export const metadata = {
  title: 'Moderation panel · Story Wall of Hope',
  description: 'Review, approve or reject stories before they appear on the public wall.'
};

export const dynamic = 'force-dynamic';

export default async function ModeratePage() {
  const unlocked = await isModUnlocked();
  const stories = unlocked ? await pendingStories() : [];

  return (
    <section className="moderate-section wrap" aria-labelledby="modHeading">
      <h2 id="modHeading">Moderation panel</h2>
      <p className="wall-sub">
        Pending stories stay private until a moderator approves them. Rejected stories are deleted.
      </p>

      {unlocked ? <ModerationPanel stories={stories} /> : <ModerationGate />}

      <p>
        <Link className="back-link" href="/">
          &larr; Back to the wall
        </Link>
      </p>
    </section>
  );
}
