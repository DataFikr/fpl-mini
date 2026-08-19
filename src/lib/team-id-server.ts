import { cookies } from 'next/headers';
import { TEAM_ID_COOKIE, parseTeamId } from './team-id';

/**
 * The team id a server component should render for: the URL's `?teamId=` when
 * present, otherwise the one the visitor last used (cookie). Server-only — it
 * reads request headers.
 */
export async function resolveTeamId(fromQuery?: string): Promise<number | undefined> {
  const explicit = parseTeamId(fromQuery);
  if (explicit) return explicit;
  return parseTeamId((await cookies()).get(TEAM_ID_COOKIE)?.value);
}
