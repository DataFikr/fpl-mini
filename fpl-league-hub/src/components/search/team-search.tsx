'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, TrendingUp } from 'lucide-react';
import { FPLManagerEntry } from '@/types/fpl';

interface TeamSearchProps {
  onTeamSelect: (team: FPLManagerEntry) => void;
}

export function TeamSearch({ onTeamSelect }: TeamSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FPLManagerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchMode] = useState<'manual'>('manual');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No autocomplete effect needed for manual search only

  const handleTeamSelect = (team: FPLManagerEntry) => {
    setQuery(team.name);
    setShowResults(false);
    onTeamSelect(team);
  };

  const handleManualSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setShowResults(false);
    
    try {
      // Check if query is a number (FPL Manager ID)
      const isManagerId = /^\d+$/.test(query.trim());
      
      if (isManagerId) {
        // Direct manager ID search - redirect to team page
        const managerId = parseInt(query.trim());
        window.location.href = `/team/${managerId}`;
        return;
      }

      // Text search - same as autocomplete but with full results
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const teams = data.teams || [];
        
        if (teams.length === 1) {
          // If only one result, auto-select it
          handleTeamSelect(teams[0]);
        } else if (teams.length > 1) {
          // Show all results
          setResults(teams);
          setShowResults(true);
        } else {
          // No results found - show message
          setResults([]);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Manual search error:', error);
      setResults([]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" ref={searchRef}>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter FPL Manager ID..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-black"
              autoComplete="off"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleManualSearch}
            disabled={isLoading || !query.trim()}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {results.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{team.name}</div>
                    <div className="text-sm text-gray-500">
                      by {team.player_first_name} {team.player_last_name}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {team.summary_overall_points?.toLocaleString() || 0} pts
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      #{team.summary_overall_rank?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
            <div className="text-gray-500 mb-2">
              No teams found matching "{query}"
            </div>
            <div className="text-sm text-gray-400">
              💡 Try: FPL Manager ID (e.g., 5879122), exact team name, or manager's name
            </div>
          </div>
        )}
      </div>
      
      {/* Search tip for Manager ID */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          💡 <span className="font-medium">Find your Manager ID:</span> Visit Fantasy Premier League at
        </p>
        <p className="font-mono text-blue-600 text-sm mt-1 break-all">
          https://fantasy.premierleague.com/entry/{'{'}manager_id{'}'}/event/3
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your Manager ID is the number that replaces {'{'}manager_id{'}'} in the URL
        </p>
      </div>
    </div>
  );
}