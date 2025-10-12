'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';
import { FaXTwitter, FaReddit } from 'react-icons/fa6';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          subscriptionType: 'general-newsletter',
        }),
      });

      if (response.ok) {
        setSubscriptionStatus('success');
        setEmail('');
        setTimeout(() => setSubscriptionStatus('idle'), 5000);
      } else {
        setSubscriptionStatus('error');
        setTimeout(() => setSubscriptionStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setSubscriptionStatus('error');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-green-800 to-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Signup */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
              <Mail className="h-6 w-6 text-yellow-300" />
              Get Weekly Updates
            </h3>
            <p className="text-green-100 mb-6">
              Subscribe to get weekly updates and mini-league insights delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {subscriptionStatus === 'success' && (
              <p className="mt-3 text-green-300 font-semibold">Successfully subscribed! Check your inbox.</p>
            )}
            {subscriptionStatus === 'error' && (
              <p className="mt-3 text-red-300 font-semibold">Failed to subscribe. Please try again.</p>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">FPLRanker</h2>
          <p className="text-green-100">Track, Rank & Compete in all your FPL mini-leagues</p>
        </div>

        {/* Footer Links Grid - 3 Columns Centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
          {/* Company Column */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-yellow-300 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-yellow-300 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-yellow-300 transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright and Disclaimer */}
        <div className="border-t border-white/20 pt-6">
          <div className="text-center text-sm space-y-2">
            <p>&copy; 2025 FPLRanker. All rights reserved.</p>
            <p className="text-green-100">Fantasy Premier League is an official game of the EPL.</p>
            <p className="text-green-100">FPLRanker is an independent tool and not affiliated.</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 flex justify-center space-x-6">
          <a
            href="https://x.com/fplranker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Follow us on X (Twitter)"
          >
            <FaXTwitter className="h-6 w-6" />
          </a>
          <a
            href="https://www.reddit.com/user/fplranker/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Follow us on Reddit"
          >
            <FaReddit className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com/FPLRanker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}