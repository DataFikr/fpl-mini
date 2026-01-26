'use client';

import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { TrendingUp, Newspaper, Users, Mail, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-jakarta font-bold text-white mb-6 leading-tight">
                Beyond the Points: How FPLRanker Turns Your Mini-League into a{' '}
                <span className="text-gradient-primary">Premier League Experience</span>
              </h1>
              <p className="text-xl text-fpl-text-secondary font-inter">
                Let's be honest: Fantasy Premier League is 10% picking players and 90% bragging to your friends.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <main className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20 mb-8">
              <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed">
                But as the season drags on, your mini-league group chat can start to feel a bit quiet.
              </p>
              <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed mt-4">
                At <span className="text-fpl-accent font-semibold">fplranker.com</span>, we believe every mini-league deserves the "Sky Sports" treatment. We've built a suite of features designed to turn your casual Saturday afternoon into a week-long drama filled with banter, headlines, and deep-dive analytics.
              </p>
              <p className="text-lg text-white font-inter font-semibold mt-6">
                Here is how you can use FPLRanker to keep your rivals engaged and your group chat buzzing.
              </p>
            </div>

            {/* Feature 1 */}
            <FeatureSection
              number={1}
              icon={<TrendingUp className="h-8 w-8" />}
              title="Watch the Drama Unfold: League Table Progression"
              subtitle="Generic tables only show you where you are now. We show you how you got there."
              featureDescription="Our League Table Progression chart tracks position changes across every single gameweek."
              banterHook={`Nothing says "bottler" like a blue line plummeting from 1st to 7th over three weeks. Use this chart to identify the "climbers" and the "divers" in your league and call them out in the chat!`}
              gradient="from-blue-500 to-cyan-500"
              imageSrc="/images/blog/fplranker_progression.png"
              imageAlt="League Table Progression Chart"
            />

            {/* Feature 2 */}
            <FeatureSection
              number={2}
              icon={<Newspaper className="h-8 w-8" />}
              title="ESPN-Style Headlines for Your League"
              subtitle="Why read about the pros when you can read about your friends?"
              featureDescription="Our Top Headlines section generates dynamic, news-style stories based on your league's actual performance."
              banterHook={`Did someone just pull off a "MASTERCLASS" with a 96-point haul? Or maybe there's a "CHAMPIONSHIP WAR" brewing between 2nd and 3rd place? Share these breaking news pop-ups to make every gameweek feel legendary.`}
              gradient="from-purple-500 to-pink-500"
              imageSrc="/images/blog/fplranker_news_highlight.png"
              imageAlt="ESPN-Style Headlines"
            />

            {/* Feature 3 */}
            <FeatureSection
              number={3}
              icon={<Users className="h-8 w-8" />}
              title="Rival Watch: The Ultimate Scouting Report"
              subtitle="To beat your rivals, you have to know their every move."
              featureDescription="The Rival Watch and Performance Analysis tabs give you a comprehensive breakdown of every team's squad composition and captaincy choices."
              banterHook={`Use this to spot the "differential" player that could ruin someone's weekend—or highlight the manager who survived solely because of a Haaland captaincy.`}
              gradient="from-green-500 to-emerald-500"
              imageSrc="/images/blog/fplranker_rival_watch.png"
              imageAlt="Rival Watch Feature"
            />

            {/* Feature 4 */}
            <FeatureSection
              number={4}
              icon={<Mail className="h-8 w-8" />}
              title="Never Miss a Beat: The League Newsletter"
              subtitle="The best part? You don't even have to visit the site to stay informed."
              featureDescription="You can now Subscribe to Your League Newsletter."
              banterHook={`Get this week's top headlines and a Complete Rival Analysis delivered straight to your inbox every Wednesday. It's the perfect mid-week "pain report" to drop into the WhatsApp group to remind everyone who's boss.`}
              gradient="from-yellow-500 to-orange-500"
              imageSrc="/images/blog/fplranker_email_newsletter.png"
              imageAlt="Email Newsletter Feature"
            />

            {/* Feature 5 */}
            <FeatureSection
              number={5}
              icon={<BarChart3 className="h-8 w-8" />}
              title="Vote on the Chaos: Community Polls"
              subtitle="Engagement is a two-way street."
              featureDescription={`Use the Community Poll tab to settle debates or predict the next big "flop" in your league.`}
              banterHook=""
              gradient="from-red-500 to-rose-500"
              imageSrc="/images/blog/fplranker_poll.png"
              imageAlt="Community Polls Feature"
            />

            {/* CTA */}
            <div className="mt-12 backdrop-blur-fpl bg-gradient-to-r from-fpl-primary/20 to-fpl-violet-700/20 rounded-fpl p-8 border border-fpl-primary/30 text-center">
              <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white mb-4">
                Ready to Transform Your Mini-League?
              </h2>
              <p className="text-fpl-text-secondary font-inter mb-6">
                Join thousands of FPL managers who are already enjoying the Sky Sports treatment for their leagues.
              </p>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet transition-all"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

function FeatureSection({
  number,
  icon,
  title,
  subtitle,
  featureDescription,
  banterHook,
  gradient,
  imageSrc,
  imageAlt,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  featureDescription: string;
  banterHook: string;
  gradient: string;
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-8 border border-fpl-primary/20 mb-8">
      <div className="flex items-start gap-6">
        <div className={`flex-shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-fpl-accent font-jakarta font-bold text-lg">#{number}</span>
            <h2 className="text-2xl font-jakarta font-bold text-white">{title}</h2>
          </div>
          <p className="text-fpl-accent font-inter italic mb-4">{subtitle}</p>

          <div className="space-y-4">
            <div>
              <span className="text-white font-jakarta font-semibold">The Feature: </span>
              <span className="text-fpl-text-secondary font-inter">{featureDescription}</span>
            </div>
            {banterHook && (
              <div>
                <span className="text-white font-jakarta font-semibold">The Banter Hook: </span>
                <span className="text-fpl-text-secondary font-inter">{banterHook}</span>
              </div>
            )}
          </div>

          {/* Feature Image */}
          {imageSrc && (
            <div className="mt-6 rounded-xl overflow-hidden border border-fpl-primary/20 shadow-lg">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={800}
                height={450}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
