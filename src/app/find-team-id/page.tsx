'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';

export default function FindTeamIDPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <main className="container mx-auto px-4 py-20">
          {/* Find Team ID Section */}
          <section className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-jakarta font-bold text-white mb-6">
                🔍 How to Find Your <span className="text-fpl-accent">Team ID</span>
              </h1>
              <p className="text-xl font-inter text-fpl-text-secondary max-w-3xl mx-auto">
                Follow these simple steps to locate your FPL Team ID
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Go to the Official FPL Website
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary mb-6">
                  Visit{' '}
                  <a
                    href="https://fantasy.premierleague.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fpl-accent hover:underline"
                  >
                    fantasy.premierleague.com
                  </a>
                  {' '}using a <strong className="text-white">web browser</strong> (not the mobile app).
                </p>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30">
                  <Image
                    src="/images/find-team-id/find_team_Id_1.png"
                    alt="FPL Website Homepage"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Log In
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary">
                  Log in to your account with your usual Fantasy Premier League credentials.
                </p>
              </div>

              {/* Step 3 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    3
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Open "Gameweek History"
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary mb-6">
                  Once logged in, click on your <strong className="text-white">Team Name</strong>, then select <strong className="text-white">Gameweek History</strong> from the menu.
                </p>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30">
                  <Image
                    src="/images/find-team-id/find_team_Id_2.png"
                    alt="Gameweek History Menu"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    4
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Locate Your Team ID in the URL
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary mb-4">
                  When the Gameweek History page opens, look at your browser's address bar.
                </p>
                <div className="bg-fpl-dark/60 rounded-lg p-4 mb-4 font-mono text-fpl-accent">
                  https://fantasy.premierleague.com/entry/<span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded">123456</span>/history
                </div>
                <p className="font-inter text-fpl-text-secondary mb-6">
                  The <strong className="text-white">6-digit number</strong> between <code className="bg-fpl-dark/60 px-2 py-1 rounded text-fpl-accent">/entry/</code> and <code className="bg-fpl-dark/60 px-2 py-1 rounded text-fpl-accent">/history</code> is your <strong className="text-white">Team ID</strong>.
                </p>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30">
                  <Image
                    src="/images/find-team-id/find_team_Id_3.png"
                    alt="Team ID in URL"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Step 5 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    5
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Copy Your Team ID
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary mb-6">
                  Highlight and copy those 6 digits (e.g. <code className="bg-fpl-dark/60 px-2 py-1 rounded text-fpl-accent">123456</code>). You could also take note of the ID.
                </p>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30">
                  <Image
                    src="/images/find-team-id/find_team_Id_4.png"
                    alt="Copy Team ID"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Step 6 */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-jakarta font-bold text-xl flex items-center justify-center">
                    6
                  </div>
                  <h2 className="text-2xl font-jakarta font-bold text-white">
                    Enter It on FPLRanker
                  </h2>
                </div>
                <p className="font-inter text-fpl-text-secondary mb-6">
                  Return to{' '}
                  <Link href="/" className="text-fpl-accent hover:underline">
                    FPLRanker.com
                  </Link>
                  , paste your Team ID into the <strong className="text-white">Team Manager ID</strong> field on the homepage, and click <strong className="text-white">Search</strong>. Alternatively, you can also type the 6-digit team ID manually.
                </p>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30 mb-6">
                  <Image
                    src="/images/find-team-id/find_team_Id_5.png"
                    alt="Enter Team ID on FPLRanker"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                <p className="font-inter text-white mb-4">You'll instantly see:</p>
                <ul className="font-inter text-fpl-text-secondary space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    All your <strong className="text-white">mini-leagues</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Your <strong className="text-white">live rankings</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <strong className="text-white">Progression charts</strong> and analytics for every gameweek
                  </li>
                </ul>
                <div className="rounded-lg overflow-hidden border border-fpl-primary/30">
                  <Image
                    src="/images/find-team-id/find_team_Id_6.png"
                    alt="FPLRanker Dashboard"
                    width={1200}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="backdrop-blur-fpl bg-gradient-to-r from-fpl-primary/20 to-fpl-violet-700/20 rounded-fpl p-8 border-2 border-fpl-accent/40">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-xl font-jakarta font-bold text-white mb-2">Tip:</h3>
                    <p className="font-inter text-fpl-text-secondary">
                      If you're managing multiple teams, repeat the same steps for each one. Each team has a unique <strong className="text-white">Team ID</strong> — make sure you use the correct one!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
