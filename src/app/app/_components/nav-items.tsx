export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  live?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  squad: <path d="M8 3l4 2 4-2 4 4-3 2v12H7V9L4 7z" />,
  leagues: <><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H4v1a3 3 0 0 0 2 2.8M18 5h2v1a3 3 0 0 1-2 2.8" /><path d="M9 19h6M10 13.5V16a2 2 0 0 1-1 2M14 13.5V16a2 2 0 0 0 1 2" /></>,
  blog: <><path d="M5 3h11l3 3v15H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
};

export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: ICONS.home, href: '/app/home' },
  { id: 'squad', label: 'Squad', icon: ICONS.squad, href: '/app/squad' },
  { id: 'leagues', label: 'Leagues', icon: ICONS.leagues, href: '/app/leagues' },
  { id: 'blog', label: 'Blog', icon: ICONS.blog, href: '/app/blog' },
];

/** Carry the manager context (teamId) across the squad/leagues tabs. */
export function navHref(n: NavItem, teamId?: string | number) {
  const carry = teamId && (n.id === 'squad' || n.id === 'leagues') ? `?teamId=${teamId}` : '';
  return n.href + carry;
}
