'use client';

import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { FaXTwitter, FaReddit } from 'react-icons/fa6';

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