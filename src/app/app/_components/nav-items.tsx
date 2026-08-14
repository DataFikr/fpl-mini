export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  live?: boolean;
  /**
   * Keep out of the mobile bottom bar. That bar fits five 52px items inside a
   * hexagon clip-path; a sixth pushes the outer two under the clipped points.
   * Sidebar-only items stay reachable from the hamburger menu.
   */
  sidebarOnly?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  squad: <path d="M8 3l4 2 4-2 4 4-3 2v12H7V9L4 7z" />,
  leagues: <><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H4v1a3 3 0 0 0 2 2.8M18 5h2v1a3 3 0 0 1-2 2.8" /><path d="M9 19h6M10 13.5V16a2 2 0 0 1-1 2M14 13.5V16a2 2 0 0 0 1 2" /></>,
  blog: <><path d="M5 3h11l3 3v15H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
  kits: <path d="M6 2 3 6l3 2v12h12V8l3-2-3-4-4 2a4 4 0 0 1-8 0z" />,
  players: <><path d="M3 20V9M9 20V4M15 20v-7M21 20V11" /><path d="M2 20h20" /></>,
};

export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: ICONS.home, href: '/app/home' },
  { id: 'squad', label: 'Squad', icon: ICONS.squad, href: '/app/squad' },
  { id: 'leagues', label: 'Leagues', icon: ICONS.leagues, href: '/app/leagues' },
  { id: 'players', label: 'Players', icon: ICONS.players, href: '/app/players' },
  { id: 'kits', label: 'Kitbag', icon: ICONS.kits, href: '/app/kits' },
  // Blog keeps its sidebar slot and stays in the hamburger menu; the bottom bar
  // only fits five.
  { id: 'blog', label: 'Blog', icon: ICONS.blog, href: '/app/blog', sidebarOnly: true },
];

/** Carry the manager context (teamId) across the squad/leagues tabs. */
export function navHref(n: NavItem, teamId?: string | number) {
  const carry = teamId && (n.id === 'squad' || n.id === 'leagues') ? `?teamId=${teamId}` : '';
  return n.href + carry;
}
