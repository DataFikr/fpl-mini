import { AppShell } from '../_components/AppShell';
import { KitsScreen, type KitTeam } from '../_components/KitsScreen';
import { FPLApiService } from '@/services/fpl-api';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';

export const metadata = { title: 'Kit Hub — FPL Ranker' };

export default async function Page() {
  let kits: KitTeam[] = [];
  try {
    const bootstrap = await new FPLApiService().getBootstrapData();
    kits = (bootstrap.teams as any[])
      .map((t) => ({ id: t.id, name: t.name, code: t.code, href: getKitbagUrlByShort(t.short_name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error('Failed to load teams for Kit Hub:', e);
  }

  return <AppShell navActive="kits"><KitsScreen kits={kits} /></AppShell>;
}
