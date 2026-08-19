import Link from 'next/link';

/**
 * Rendered (with a real 404) when the requested manager ID does not exist in the
 * FPL API — a mistyped ID, or one from a previous season, since FPL issues new
 * entry IDs every year. Previously these IDs rendered placeholder team data,
 * which looked like a real team that had simply scored nothing.
 */
export default function TeamNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark flex items-center justify-center p-8">
      <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 max-w-lg text-center border border-fpl-accent/20">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-jakarta font-bold text-white mb-3">Team not found</h1>
        <p className="text-fpl-text-secondary font-inter mb-6">
          No FPL manager has that team ID this season. Team IDs are reissued every
          season, so one from a previous year will not work — check the number and
          try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-fpl-accent/20 text-fpl-accent rounded-fpl hover:bg-fpl-accent/30 transition-colors font-jakarta"
          >
            Enter a different ID
          </Link>
          <Link
            href="/app/find-team-id"
            className="inline-block px-6 py-2 border border-fpl-accent/30 text-fpl-text-secondary rounded-fpl hover:bg-fpl-accent/10 transition-colors font-jakarta"
          >
            Find your team ID
          </Link>
        </div>
      </div>
    </div>
  );
}
