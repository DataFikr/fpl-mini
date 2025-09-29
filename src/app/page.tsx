'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamSearch } from '@/components/search/team-search';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/seo/structured-data';
import { Footer } from '@/components/ui/footer';
import { FPLManagerEntry } from '@/types/fpl';
import { Trophy, Users, TrendingUp, BarChart3, Star, Zap, Target, ArrowUp, Crown, Brain, Vote } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<FPLManagerEntry | null>(null);
  const router = useRouter();

  const handleTeamSelect = (team: FPLManagerEntry) => {
    setSelectedTeam(team);
    router.push(`/team/${team.id}`);
  };

  return (
    <>
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/images/fplranker.png"
                  alt="FPL Ranker Logo"
                  width={120}
                  height={120}
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">FPLRanker</span>
            </h1>
            <div className="text-lg text-gray-600 mb-2 font-medium">fplranker.com</div>
            <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your ultimate Fantasy Premier League analytics platform. Track progress, analyze performance, and dominate your mini-leagues with{' '}
              <span className="font-semibold text-green-600">powerful insights</span> and{' '}
              <span className="font-semibold text-blue-600">real-time data</span>.
            </p>
            
            <TeamSearch onTeamSelect={handleTeamSelect} />
            
            <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Live FPL Data</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">Instant Analytics</span>
              </div>
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ever <span className="text-green-600">Wondered</span> About Your League?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant answers to the questions that matter most to FPL managers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <QuestionCard
              icon={<ArrowUp className="h-8 w-8 text-green-500" />}
              question="Wonder which team in your mini league has progressed the most?"
              answer="Track rank movements across gameweeks with our interactive progression charts"
              gradient="from-green-500 to-emerald-500"
            />
            <QuestionCard
              icon={<Brain className="h-8 w-8 text-blue-500" />}
              question="Which manager made the smartest move using their chip?"
              answer="Analyze chip usage timing and effectiveness across all teams in your league"
              gradient="from-blue-500 to-cyan-500"
            />
            <QuestionCard
              icon={<Crown className="h-8 w-8 text-yellow-500" />}
              question="Which manager picked the captain with the most points?"
              answer="Compare captaincy choices and see who's making the best decisions"
              gradient="from-yellow-500 to-orange-500"
            />
            <QuestionCard
              icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
              question="How has your team progressed throughout the gameweeks?"
              answer="Visualize your rank journey with detailed performance analytics"
              gradient="from-purple-500 to-pink-500"
            />
            <QuestionCard
              icon={<Vote className="h-8 w-8 text-indigo-500" />}
              question="Want your vote to count in the community poll?"
              answer="Participate in weekly predictions and see how your league thinks"
              gradient="from-indigo-500 to-purple-500"
            />
            <QuestionCard
              icon={<BarChart3 className="h-8 w-8 text-rose-500" />}
              question="Ready to gain an edge over your rivals?"
              answer="Deep-dive squad analysis reveals hidden patterns and opportunities"
              gradient="from-rose-500 to-pink-500"
            />
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl inline-block">
              <div className="text-lg font-semibold">🚀 All answers are just one search away!</div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-2xl p-12 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-yellow-300">Elevate</span> Your FPL Game?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join thousands of managers who use FPLRanker.com to track their leagues,
              analyze their squads, and make smarter decisions every gameweek.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-300">Live</div>
                <div className="text-green-100">FPL Data</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-300">No</div>
                <div className="text-green-100">Registration</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-300">Mobile</div>
                <div className="text-green-100">Optimized</div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-300">Get Started in Seconds</h3>
              <p className="text-green-100 mb-6">Simply search for your team name or enter your FPL Manager ID above to access your personalized dashboard.</p>
              <div className="text-sm text-green-200">
                💡 Find your Manager ID at fantasy.premierleague.com - it's the number in your URL!
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

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function QuestionCard({ icon, question, answer, gradient }: {
  icon: React.ReactNode;
  question: string;
  answer: string;
  gradient?: string;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
        {question}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {answer}
      </p>
    </div>
  );
}
