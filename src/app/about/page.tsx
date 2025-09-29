import Link from 'next/link';
import { Target, Users, BarChart3, Trophy, Zap, Heart } from 'lucide-react';
import { Footer } from '@/components/ui/footer';

export const metadata = {
  title: 'About Us - FPLRanker',
  description: 'Learn about FPLRanker - your home for mini-league domination and FPL analytics.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
          >
            ← Back to FPLRanker
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">FPLRanker</span>
          </h1>
          <div className="text-2xl text-gray-700 mb-4">
            Welcome to FPLRanker — your home for mini-league domination! 🎯
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Problem Statement */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
            <div className="text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Fantasy Premier League is fun, but let's be honest: keeping track of all your mini-leagues,
                rivals, and weekly rank changes can get overwhelming. That's why we built FPLRanker:
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Simple Dashboard</h3>
                  <p className="text-gray-600 text-sm">A simple, engaging dashboard that lets you oversee all your leagues in one place.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Rank Progression</h3>
                  <p className="text-gray-600 text-sm">Interactive rank progression charts to track your journey week by week.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Rival Watch</h3>
                  <p className="text-gray-600 text-sm">Rival Watch tools to see who's gaining on you.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gamification</h3>
                  <p className="text-gray-600 text-sm">Community polls, gamification badges, and breaking-news style updates to keep it exciting.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-8 md:p-12 mb-8">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Our Mission is Simple:</h2>
              <div className="text-xl leading-relaxed">
                👉 Help every manager save time, play smarter, and enjoy FPL even more with their friends and rivals.
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built For Every FPL Manager</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-green-50">
                <Heart className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Casual Players</h3>
                <p className="text-gray-600 text-sm">Just want to keep up with your mates and have some fun</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-blue-50">
                <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Stats Nerds</h3>
                <p className="text-gray-600 text-sm">Love diving deep into data and analytics</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-purple-50">
                <Trophy className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Competitors</h3>
                <p className="text-gray-600 text-sm">Want bragging rights in the office league</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-gray-700">
                Whether you're a casual player, a stats nerd, or someone who just wants bragging rights in the office league —
                <span className="font-semibold text-green-600"> FPLRanker is built for you</span>.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Tracking Your Leagues
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}