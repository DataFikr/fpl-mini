import { AppShell } from '../_components/AppShell';
import { KitDropScreen } from '../_components/KitDropScreen';

export const metadata = {
  title: 'Kitbag 26/27 Kit Drop — FPL Ranker',
  description: 'Shop the official 2026/27 Premier League kits at Kitbag — Arsenal, Liverpool, Man City, Man United and Aston Villa home & away shirts. Affiliate links.',
};

export default function Page() {
  return <AppShell navActive="kits" title="Kitbag"><KitDropScreen /></AppShell>;
}
