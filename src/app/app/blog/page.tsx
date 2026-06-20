import { AppShell } from '../_components/AppShell';
import { BlogScreen } from '../_components/BlogScreen';

export const metadata = { title: 'Blog — FPL Ranker' };

export default function Page() {
  return <AppShell navActive="blog"><BlogScreen /></AppShell>;
}
