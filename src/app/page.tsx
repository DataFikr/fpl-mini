'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/seo/structured-data';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Trophy, Users, TrendingUp, BarChart3, Star, Zap, Target, Search, Monitor, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center" id="hero">
        <div className="absolute inset-0 bg-animated-gradient opacity-20"></div>

        {/* Two Column Layout */}
        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

            {/* Left Column - 60% */}
            <div className="w-full lg:w-[60%]">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-jakarta font-bold text-white mb-6 leading-tight">
                Ultimate Weekly <span className="text-gradient-primary">Fantasy Premier League</span> Mini-League Analysis Tool
              </h1>
              <p className="text-lg md:text-xl text-fpl-text-secondary mb-8 max-w-2xl leading-relaxed">
                Track your mini league progress, get ESPN-style headlines, and monitor rank changes in real-time.
              </p>

              <div className="mb-8 max-w-xl">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="manager-id-input"
                      placeholder="Enter FPL Manager ID..."
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-black"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          const managerId = input.value.trim();
                          if (managerId && /^\d+$/.test(managerId)) {
                            router.push(`/team/${managerId}`);
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const input = document.getElementById('manager-id-input') as HTMLInputElement;
                      const managerId = input?.value.trim();
                      if (managerId && /^\d+$/.test(managerId)) {
                        router.push(`/team/${managerId}`);
                      }
                    }}
                    className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                  >
                    Search
                  </button>
                </div>
                <div className="mt-4">
                  <Link
                    href="/find-team-id"
                    className="inline-flex items-center gap-2 text-fpl-accent hover:text-fpl-violet-400 transition-colors font-inter text-sm"
                  >
                    <span>Not sure what is your team ID?</span>
                    <span className="underline font-semibold">Find Team ID here</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
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

            {/* Right Column - 40% - YouTube Short */}
            <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[320px]">
                {/* Video Container with 9:16 aspect ratio */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-fpl-primary/30" style={{ aspectRatio: '9/16' }}>
                  <iframe
                    src="https://www.youtube.com/embed/2kpeUOg0wwQ?loop=1&playlist=2kpeUOg0wwQ"
                    title="FPL Ranker Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                {/* Caption below video */}
                <div className="mt-4 text-center">
                  <p className="text-fpl-accent font-jakarta font-semibold text-lg">Watch: How it Works</p>
                  <p className="text-fpl-text-secondary font-inter text-sm">Short video showcasing FPLRanker in action</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 backdrop-blur-fpl bg-fpl-dark/40" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-jakarta font-bold text-white mb-6">
              Powerful Features for <span className="text-fpl-accent">FPL Managers</span>
            </h2>
            <p className="text-xl font-inter text-fpl-text-secondary max-w-3xl mx-auto">
              Everything you need to dominate your Fantasy Premier League mini-league
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Weekly League Analysis"
              description="In-depth stats and insights for each gameweek to understand your mini-league dynamics"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Monitor className="h-8 w-8" />}
              title="Mini-League Performance Dashboard"
              description="Interactive rank tracking with real-time updates and visual progression charts"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Rank Movement Tracker"
              description="See who's climbing or sliding each gameweek with detailed position changes"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="ESPN-Style Mini-League Headlines"
              description="Get exciting news updates tailored for your league with broadcast-quality summaries"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">

        {/* How It Works Section */}
        <section className="py-20" id="how-it-works">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-jakarta font-bold text-white mb-6">
              How It <span className="text-fpl-accent">Works</span>
            </h2>
            <p className="text-xl font-inter text-fpl-text-secondary max-w-3xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-jakarta font-bold text-2xl mb-6">
                1
              </div>
              <div className="mb-4">
                <LinkIcon className="h-12 w-12 text-fpl-accent mx-auto" />
              </div>
              <h3 className="text-xl font-jakarta font-bold text-white mb-4">
                Link your FPL mini league
              </h3>
              <p className="font-inter text-fpl-text-secondary">
                Simply enter your mini-league ID from fantasy.premierleague.com to get started
              </p>
            </div>

            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-jakarta font-bold text-2xl mb-6">
                2
              </div>
              <div className="mb-4">
                <BarChart3 className="h-12 w-12 text-fpl-accent mx-auto" />
              </div>
              <h3 className="text-xl font-jakarta font-bold text-white mb-4">
                View weekly performance and analytics
              </h3>
              <p className="font-inter text-fpl-text-secondary">
                Access interactive charts, rank progression, and detailed squad analysis instantly
              </p>
            </div>

            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-jakarta font-bold text-2xl mb-6">
                3
              </div>
              <div className="mb-4">
                <Trophy className="h-12 w-12 text-fpl-accent mx-auto" />
              </div>
              <h3 className="text-xl font-jakarta font-bold text-white mb-4">
                Share headlines and outrank your rivals!
              </h3>
              <p className="font-inter text-fpl-text-secondary">
                Get ESPN-style headlines and competitive insights to dominate your league
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-fpl-primary to-fpl-violet-700 rounded-fpl shadow-fpl-glow-violet p-12 text-center text-white overflow-hidden" id="cta">
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


        {/* FAQ Section */}
        <section className="py-20" id="faq">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-jakarta font-bold text-white mb-6">
              Frequently Asked <span className="text-fpl-accent">Questions</span>
            </h2>
            <p className="text-xl font-inter text-fpl-text-secondary max-w-3xl mx-auto">
              Everything you need to know about FPLRanker
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <FAQItem
              question="What is FPLRanker.com?"
              answer="FPLRanker.com is a dedicated platform designed to help Fantasy Premier League mini-league players track their league standings, analyze weekly team progression, and receive engaging ESPN-style mini-league headlines for added fun and competition."
            />
            <FAQItem
              question="How do I link my mini-league to FPLRanker.com?"
              answer="Simply enter your official Fantasy Premier League mini-league ID or link your league directly from your FPL account dashboard. Our system will automatically sync your league data to provide real-time updates and analytics throughout the season."
            />
            <FAQItem
              question="Can I track rank changes and team progress over multiple gameweeks?"
              answer="Yes, FPLRanker.com offers interactive charts and dashboards that visualize each team's rank progression week by week, helping you identify trends and make strategic transfers."
            />
            <FAQItem
              question="What are ESPN-style mini-league headlines?"
              answer="These are dynamic, professionally styled headlines summarizing the biggest performances and surprises in your mini-league each gameweek. They are perfect for sharing in league chats or on social media to keep everyone engaged."
            />
            <FAQItem
              question="Is FPLRanker.com mobile-friendly?"
              answer="Absolutely. Our platform is fully optimized for mobile devices, allowing you to manage and track your mini-league on the go with a smooth, responsive interface."
            />
            <FAQItem
              question="Do I need to pay to use FPLRanker.com?"
              answer="No, FPLRanker.com is completely free to use. All core features including mini-league tracking, ESPN-style headlines, rank progression charts, and alerts are available at no cost. Our mission is to help Fantasy Premier League managers compete smarter without any subscription fees or hidden charges."
            />
            <FAQItem
              question="Is my mini-league data safe with FPLRanker.com?"
              answer="We take privacy seriously. Your league data is securely synced and never shared with third parties. We comply with official FPL data policies to ensure your information remains confidential."
            />
            <FAQItem
              question="How accurate is the data on FPLRanker.com?"
              answer="We source data directly from official Fantasy Premier League feeds and update in real-time to provide the most accurate and up-to-date league information."
            />
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
    <div className="group backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 text-center hover:shadow-fpl-glow-violet transition-all duration-300 transform hover:-translate-y-2 border border-fpl-primary/20">
      <div className={`inline-flex p-4 rounded-fpl bg-gradient-to-r ${gradient || 'from-gray-400 to-gray-600'} mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-jakarta font-bold text-white mb-4">
        {title}
      </h3>
      <p className="font-inter text-fpl-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-fpl-primary/10 transition-colors"
      >
        <h3 className="text-lg font-jakarta font-semibold text-white pr-4">
          {question}
        </h3>
        <div className={`flex-shrink-0 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-fpl-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-2">
          <p className="font-inter text-fpl-text-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
