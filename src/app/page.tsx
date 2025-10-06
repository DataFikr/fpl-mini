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
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-animated-gradient opacity-20"></div>

        {/* Large Icon on Left */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/fplranker.png"
              alt="FPL Ranker Logo"
              width={500}
              height={500}
              className="rounded-3xl shadow-fpl-glow opacity-90"
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 lg:pl-[40%]">
          <div className="mb-12">
            {/* Mobile Icon */}
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="relative">
                <Image
                  src="/images/fplranker.png"
                  alt="FPL Ranker Logo"
                  width={120}
                  height={120}
                  className="rounded-2xl shadow-fpl-glow"
                />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-jakarta font-bold text-white mb-6">
              <span className="text-gradient-primary">FPLRanker</span>
            </h1>
            <p className="text-xl md:text-2xl text-fpl-text-secondary mb-8 max-w-3xl leading-relaxed">
              Your ultimate Fantasy Premier League analytics platform. Track progress, analyze performance, and dominate your mini-leagues with{' '}
              <span className="font-jakarta font-semibold text-fpl-accent">powerful insights</span> and{' '}
              <span className="font-jakarta font-semibold text-fpl-violet-400">real-time data</span>.
            </p>

            <TeamSearch onTeamSelect={handleTeamSelect} />

            <div className="mt-8 flex flex-wrap justify-start gap-6 text-sm">
              <div className="flex items-center backdrop-blur-fpl bg-fpl-dark/40 px-4 py-2 rounded-fpl border border-fpl-primary/20">
                <Star className="h-5 w-5 text-fpl-accent mr-2" />
                <span className="font-jakarta font-medium text-white">Live FPL Data</span>
              </div>
              <div className="flex items-center backdrop-blur-fpl bg-fpl-dark/40 px-4 py-2 rounded-fpl border border-fpl-primary/20">
                <Zap className="h-5 w-5 text-fpl-accent mr-2" />
                <span className="font-jakarta font-medium text-white">Instant Analytics</span>
              </div>
              <div className="flex items-center backdrop-blur-fpl bg-fpl-dark/40 px-4 py-2 rounded-fpl border border-fpl-primary/20">
                <Target className="h-5 w-5 text-fpl-accent mr-2" />
                <span className="font-jakarta font-medium text-white">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions CTA Section */}
      <section className="py-16 backdrop-blur-fpl bg-fpl-dark/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-jakarta font-bold text-white mb-4">
              Ever <span className="text-fpl-accent">Wondered</span> About Your League?
            </h2>
            <p className="text-xl font-inter text-fpl-text-secondary max-w-3xl mx-auto">
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
            <div className="bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white px-8 py-4 rounded-fpl inline-block shadow-fpl-glow-violet">
              <div className="text-lg font-jakarta font-semibold">🚀 All answers are just one search away!</div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-fpl-primary to-fpl-violet-700 rounded-fpl shadow-fpl-glow-violet p-12 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-fpl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-jakarta font-bold mb-6">
              Ready to <span className="text-fpl-accent">Elevate</span> Your FPL Game?
            </h2>
            <p className="text-xl font-inter text-fpl-lime-100 mb-8 max-w-3xl mx-auto">
              Join thousands of managers who use FPLRanker to track their leagues,
              analyze their squads, and make smarter decisions every gameweek.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="backdrop-blur-fpl bg-white/10 rounded-fpl p-6">
                <div className="text-3xl font-jakarta font-bold text-fpl-accent">Live</div>
                <div className="font-inter text-fpl-lime-100">FPL Data</div>
              </div>
              <div className="backdrop-blur-fpl bg-white/10 rounded-fpl p-6">
                <div className="text-3xl font-jakarta font-bold text-fpl-accent">No</div>
                <div className="font-inter text-fpl-lime-100">Registration</div>
              </div>
              <div className="backdrop-blur-fpl bg-white/10 rounded-fpl p-6">
                <div className="text-3xl font-jakarta font-bold text-fpl-accent">Mobile</div>
                <div className="font-inter text-fpl-lime-100">Optimized</div>
              </div>
            </div>

            <div className="backdrop-blur-fpl bg-white/20 rounded-fpl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-jakarta font-semibold mb-4 text-fpl-accent">Get Started in Seconds</h3>
              <p className="font-inter text-fpl-lime-100 mb-6">Simply search for your team name or enter your FPL Manager ID above to access your personalized dashboard.</p>
              <div className="text-sm font-inter text-fpl-lime-200">
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
    <div className="group backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 hover:shadow-fpl-glow-violet transition-all duration-300 transform hover:-translate-y-1 border border-fpl-primary/20">
      <div className={`inline-flex p-3 rounded-fpl bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-jakarta font-bold text-white mb-3 leading-tight">
        {question}
      </h3>
      <p className="font-inter text-fpl-text-secondary text-sm leading-relaxed">
        {answer}
      </p>
    </div>
  );
}
