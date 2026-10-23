import StoryWall from '@/components/StoryWall';
import { getPublicStories } from '@/app/actions';

// Always read the JSON store fresh — never cache the wall at build time.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stories = await getPublicStories();
  return <StoryWall stories={stories} />;
}
