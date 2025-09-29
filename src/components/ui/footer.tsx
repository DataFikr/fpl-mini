'use client';

import Link from 'next/link';
import { Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">FPLRanker</h2>
          <p className="text-green-100">Track, Rank & Compete in all your FPL mini-leagues</p>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Features Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-yellow-300 transition-colors">Live Standings</Link></li>
              <li><Link href="/" className="hover:text-yellow-300 transition-colors">Progression</Link></li>
              <li><Link href="/" className="hover:text-yellow-300 transition-colors">Rivals</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-yellow-300 transition-colors">About Us</Link></li>
              <li><span className="text-gray-300">Blog (future)</span></li>
              <li><span className="text-gray-300">Careers (opt)</span></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-yellow-300 transition-colors">Contact</Link></li>
              <li><span className="text-gray-300">FAQ (future)</span></li>
              <li><span className="text-gray-300">Help Center</span></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-300">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-yellow-300 transition-colors">Privacy</Link></li>
              <li><span className="text-gray-300">Terms</span></li>
              <li><span className="text-gray-300">Cookies</span></li>
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
            href="https://twitter.com/FPLRanker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Follow us on Twitter"
          >
            <Twitter className="h-6 w-6" />
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
          <a
            href="https://youtube.com/FPLRanker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Subscribe to our YouTube channel"
          >
            <Youtube className="h-6 w-6" />
          </a>
          <a
            href="https://discord.gg/FPLRanker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-300 transition-colors"
            aria-label="Join our Discord community"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}