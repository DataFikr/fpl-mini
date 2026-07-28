import { redirect } from 'next/navigation';

// The marketing/landing experience lives at /app (Sportify). next.config also
// redirects "/" → "/app" at the edge; this server redirect is the in-router
// fallback and keeps the old FR-DLS home page out of the bundle.
export default function RootIndex() {
  redirect('/app');
}
