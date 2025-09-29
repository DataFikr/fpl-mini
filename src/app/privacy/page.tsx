import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';
import { Footer } from '@/components/ui/footer';

export const metadata = {
  title: 'Privacy Policy - FPLRanker',
  description: 'Privacy Policy for FPLRanker - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
          >
            ← Back to FPLRanker
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              At FPLRanker (<a href="https://fplranker.com" className="text-green-600 hover:text-green-700">https://fplranker.com</a>),
              we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
            </p>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-700">If you create an account, we may collect your email address and display name.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Fantasy Premier League Data</h3>
                  <p className="text-gray-700">When you connect your FPL team, we access public FPL API data such as team name, league standings, player selections, and gameweek points.</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies & Analytics</h3>
                  <p className="text-gray-700">We use cookies and tools like Google Analytics to understand traffic patterns and improve your experience.</p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Information</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  To display your team and mini-league data.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  To provide insights, charts, and breaking news related to your leagues.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  To improve our website functionality and user engagement.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  To show relevant ads or affiliate offers.
                </li>
              </ul>
            </section>

            {/* Sharing of Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing of Information</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700 font-medium mb-2">We do not sell or rent your personal information.</p>
                <p className="text-gray-700">Data may be shared with third-party services (Google AdSense, affiliate partners) strictly for advertising and analytics.</p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
                  <p className="text-gray-700 text-sm">You may request deletion of your account and related data by contacting us.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookie Control</h3>
                  <p className="text-gray-700 text-sm">You can disable cookies in your browser settings.</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg text-center">
              <Mail className="h-8 w-8 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Questions About This Policy?</h2>
              <p className="mb-4">If you have any questions about this policy, contact us at:</p>
              <a
                href="mailto:support@fplranker.com"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                support@fplranker.com
              </a>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}