import { AppShell } from '../_components/AppShell';
import { FatigueScreen } from '../_components/FatigueScreen';

export const metadata = { title: 'WC Fatigue — FPL Ranker' };

export default function Page() {
  return <AppShell navActive="fatigue"><FatigueScreen /></AppShell>;
}
