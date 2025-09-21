'use client';

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
            <p className="text-lg text-gray-600 mb-4">We encountered an error while loading this team page.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">What happened?</h2>
            <p className="text-gray-700 mb-2">There was an issue loading the team data.</p>
            {error.message && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {error.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              🔄 Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block"
            >
              🏠 Go Home
            </a>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Try these working team examples:</strong><br/>
              <a href="/team/5093819" className="text-blue-600 hover:underline mr-4">Team 5093819</a>
              <a href="/team/5100818" className="text-blue-600 hover:underline mr-4">Team 5100818</a>
              <a href="/team/2611653" className="text-blue-600 hover:underline">Team 2611653</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}