'use client';

import { Target, Users, BarChart3, Trophy } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <main className="container mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex p-4 rounded-fpl bg-gradient-to-r from-fpl-primary to-fpl-violet-700 mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-jakarta font-bold text-white mb-6">
              About <span className="text-fpl-accent">FPLRanker</span>
            </h1>
            <p className="text-2xl font-inter text-fpl-text-secondary mb-4">
              Welcome to FPLRanker — your home for mini-league domination! 🎯
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {/* Problem Statement */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 md:p-12 mb-8 border border-fpl-primary/20">
              <div className="text-lg font-inter text-fpl-text-secondary leading-relaxed space-y-4">
                <p>
                  Fantasy Premier League is fun, but let's be honest: keeping track of all your mini-leagues,
                  rivals, and weekly rank changes can get overwhelming. That's why we built FPLRanker:
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-fpl-primary/20 p-2 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-fpl-accent" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-semibold text-white">Simple Dashboard</h3>
                    <p className="font-inter text-fpl-text-secondary text-sm">A simple, engaging dashboard that lets you oversee all your leagues in one place.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-fpl-primary/20 p-2 rounded-lg">
                    <Target className="h-6 w-6 text-fpl-accent" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-semibold text-white">Rank Progression</h3>
                    <p className="font-inter text-fpl-text-secondary text-sm">Interactive rank progression charts to track your journey week by week.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-fpl-primary/20 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-fpl-accent" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-semibold text-white">Rival Watch</h3>
                    <p className="font-inter text-fpl-text-secondary text-sm">Rival Watch tools to see who's gaining on you.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-fpl-primary/20 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-fpl-accent" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-semibold text-white">Gamification</h3>
                    <p className="font-inter text-fpl-text-secondary text-sm">Community polls, gamification badges, and breaking-news style updates to keep it exciting.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white rounded-fpl shadow-fpl-glow-violet p-8 md:p-12 mb-8">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-6" />
                <h2 className="text-3xl font-jakarta font-bold mb-6">Our Mission is Simple:</h2>
                <p className="text-xl font-inter leading-relaxed">
                  👉 Help every manager save time, play smarter, and enjoy FPL even more with their friends and rivals.
                </p>
              </div>
            </div>

            {/* Values Section */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 md:p-12 border border-fpl-primary/20">
              <h2 className="text-2xl font-jakarta font-bold text-white mb-6 text-center">What We Stand For</h2>
              <div className="space-y-4 font-inter text-fpl-text-secondary">
                <div className="flex items-start space-x-3">
                  <span className="text-fpl-accent text-xl">✓</span>
                  <p><strong className="text-white">Free & Accessible</strong> - FPLRanker is free to use. No hidden fees, no premium paywalls.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-fpl-accent text-xl">✓</span>
                  <p><strong className="text-white">Community-Driven</strong> - We listen to your feedback and continuously improve based on what FPL managers actually need.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-fpl-accent text-xl">✓</span>
                  <p><strong className="text-white">Data-Powered</strong> - Real-time updates, accurate stats, and insights you can trust.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-fpl-accent text-xl">✓</span>
                  <p><strong className="text-white">For the Love of the Game</strong> - Built by FPL enthusiasts who understand the thrill (and agony) of gameweek deadlines.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
