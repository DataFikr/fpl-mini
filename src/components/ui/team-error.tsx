'use client';

import Link from 'next/link';

interface TeamErrorProps {
  teamId: number;
  error?: string;
}

export function TeamError({ teamId, error }: TeamErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
            <p className="text-lg text-gray-600 mb-4">We couldn't load the data for team ID {teamId}.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Possible reasons:</h2>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-center">
                <span className="text-red-500 mr-2">•</span>
                Team ID {teamId} may not exist in Fantasy Premier League
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-2">•</span>
                FPL API is temporarily unavailable
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-2">•</span>
                Network connectivity issues
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              🔄 Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block"
            >
              🏠 Go Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Try these working team examples:</strong><br/>
              <Link href="/team/5093819" className="text-blue-600 hover:underline mr-4">Team 5093819</Link>
              <Link href="/team/5100818" className="text-blue-600 hover:underline mr-4">Team 5100818</Link>
              <Link href="/team/2611653" className="text-blue-600 hover:underline">Team 2611653</Link>
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error details:</strong> {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}