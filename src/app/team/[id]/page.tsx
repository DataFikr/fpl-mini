import { notFound } from 'next/navigation';

interface TeamPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TeamPageProps) {
  return {
    title: 'Team Page - FPL League Hub',
    description: 'Fantasy Premier League team dashboard.'
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (isNaN(teamId)) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Team {teamId}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              This is a minimal test version to isolate any server rendering issues.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Basic Team Information
              </h2>
              <p className="text-blue-800">
                Team ID: {teamId}<br/>
                Status: Working<br/>
                Server Rendering: Success
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-red-900 mb-4">
              Error Caught
            </h1>
            <p className="text-red-600">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}