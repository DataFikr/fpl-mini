'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-fpl-dark/80 border-b border-fpl-primary/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/fplranker.png"
              alt="FPL Ranker Logo"
              width={40}
              height={40}
              className="rounded-lg shadow-fpl-glow group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-jakarta font-bold text-white">
              FPL<span className="text-fpl-accent">Ranker</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#find-team-id"
              className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors"
            >
              Find Team ID
            </Link>
            <Link
              href="#faq"
              className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#cta"
              className="px-6 py-2.5 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet transition-all"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-fpl-primary/20 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-fpl-primary/20 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#find-team-id"
                className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Team ID
              </Link>
              <Link
                href="#faq"
                className="font-jakarta font-medium text-fpl-text-secondary hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="#cta"
                className="px-6 py-2.5 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet transition-all text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
