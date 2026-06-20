import { AppShell } from '../_components/AppShell';
import { HomeScreen } from '../_components/HomeScreen';

export const metadata = { title: 'Home — FPL Ranker' };

export default function Page() {
  return <AppShell navActive="home"><HomeScreen /></AppShell>;
}
