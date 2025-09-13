'use client';

import { useEffect } from 'react';

export default function LeagueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('League page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">League Load Error</h1>
        <p className="text-gray-600 mb-6">
          We couldn't load this Fantasy Premier League. This might be due to:
        </p>
        <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
          <li>• Invalid league ID</li>
          <li>• Network connectivity issues</li>
          <li>• FPL API temporarily unavailable</li>
        </ul>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}