'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamSearch } from '@/components/search/team-search';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/seo/structured-data';
import { FPLManagerEntry } from '@/types/fpl';
import { Trophy, Users, TrendingUp, BarChart3, Star, Zap, Target } from 'lucide-react';

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
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-2xl">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              FPL League <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your Fantasy Premier League experience with powerful analytics, 
              <span className="font-semibold text-green-600"> real-time insights</span>, and{' '}
              <span className="font-semibold text-blue-600">comprehensive league tracking</span>.
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
      
      <main className="container mx-auto px-4 pb-16">

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-green-600">Dominate</span> Your Leagues
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for serious FPL managers who want to stay ahead of the competition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <FeatureCard
              icon={<Trophy className="h-10 w-10 text-yellow-500" />}
              title="Live Rankings"
              description="Real-time league standings across all your mini-leagues with instant updates"
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-green-500" />}
              title="Progression Charts"
              description="Beautiful interactive charts showing your rank movements throughout the season"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-500" />}
              title="Squad Analytics"
              description="Deep dive into team selections, formations, and player performance data"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-purple-500" />}
              title="Performance Insights"
              description="Smart analysis that helps you make better decisions in minutes, not hours"
              gradient="from-purple-500 to-pink-500"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl shadow-2xl p-12 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-yellow-300">Elevate</span> Your FPL Game?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join thousands of managers who use FPL League Hub to track their leagues,
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
