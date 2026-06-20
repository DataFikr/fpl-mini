import { redirect } from 'next/navigation';

// Rank My Team now lives inside My Squad (the verdict renders under the pitch).
export default function RmtRedirect() {
  redirect('/app/squad');
}
