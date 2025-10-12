'use client';

import { Shield, Mail } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <main className="container mx-auto px-4 py-20 max-w-4xl">
          <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 md:p-12 border border-fpl-primary/20">
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-fpl bg-gradient-to-r from-fpl-primary to-fpl-violet-700 mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-jakarta font-bold text-white mb-2">Privacy Policy</h1>
              <p className="font-inter text-fpl-text-secondary">Last updated: January 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <p className="text-lg font-inter text-fpl-text-secondary">
                At FPLRanker, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
              </p>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-jakarta font-bold text-white mb-4">Information We Collect</h2>

                <div className="space-y-4">
                  <div className="bg-fpl-primary/10 p-4 rounded-lg border border-fpl-accent/30">
                    <h3 className="font-jakarta font-semibold text-white mb-2">Personal Information</h3>
                    <p className="font-inter text-fpl-text-secondary">If you create an account, we may collect your email address and display name.</p>
                  </div>

                  <div className="bg-fpl-primary/10 p-4 rounded-lg border border-fpl-accent/30">
                    <h3 className="font-jakarta font-semibold text-white mb-2">Fantasy Premier League Data</h3>
                    <p className="font-inter text-fpl-text-secondary">When you connect your FPL team, we access public FPL API data such as team name, league standings, player selections, and gameweek points.</p>
                  </div>

                  <div className="bg-fpl-primary/10 p-4 rounded-lg border border-fpl-accent/30">
                    <h3 className="font-jakarta font-semibold text-white mb-2">Cookies & Analytics</h3>
                    <p className="font-inter text-fpl-text-secondary">We use cookies and tools like Google Analytics to understand traffic patterns and improve your experience.</p>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-jakarta font-bold text-white mb-4">How We Use Information</h2>
                <ul className="space-y-2 font-inter text-fpl-text-secondary">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To display your team and mini-league data
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To provide insights, charts, and breaking news related to your leagues
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To improve our website functionality and user engagement
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To communicate with you about service updates and features
                  </li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-jakarta font-bold text-white mb-4">Data Sharing</h2>
                <p className="font-inter text-fpl-text-secondary mb-4">
                  We <strong className="text-white">do not sell</strong> your personal information to third parties. We only share data:
                </p>
                <ul className="space-y-2 font-inter text-fpl-text-secondary">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    With service providers (e.g., hosting, analytics) that help operate FPLRanker
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    When required by law or to protect our legal rights
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-jakarta font-bold text-white mb-4">Your Rights</h2>
                <p className="font-inter text-fpl-text-secondary">You have the right to:</p>
                <ul className="space-y-2 font-inter text-fpl-text-secondary mt-4">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Access your personal information
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Request correction or deletion of your data
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-fpl-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Opt-out of marketing communications
                  </li>
                </ul>
              </section>

              {/* Security */}
              <section>
                <h2 className="text-2xl font-jakarta font-bold text-white mb-4">Security</h2>
                <p className="font-inter text-fpl-text-secondary">
                  We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-fpl-primary/10 p-6 rounded-lg border border-fpl-accent/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-6 w-6 text-fpl-accent" />
                  <h2 className="text-2xl font-jakarta font-bold text-white">Questions?</h2>
                </div>
                <p className="font-inter text-fpl-text-secondary">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:support@fplranker.com" className="text-fpl-accent hover:text-fpl-violet-400 transition-colors">
                    support@fplranker.com
                  </a>
                </p>
              </section>

              {/* FPL Disclaimer */}
              <section className="text-center pt-8 border-t border-fpl-primary/20">
                <p className="font-inter text-fpl-text-secondary text-sm">
                  FPLRanker is an independent tool and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
