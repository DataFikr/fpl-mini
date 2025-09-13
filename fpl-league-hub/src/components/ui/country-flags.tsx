'use client';

import { useState, useEffect } from 'react';
import { Globe, Users } from 'lucide-react';

interface CountryData {
  country: string;
  countryCode: string;
  flag: string;
  managers: string[];
  confidence: number;
}

interface CountryFlagsProps {
  leagueId: number;
  managerNames: string[];
  className?: string;
}

export function CountryFlags({ leagueId, managerNames, className = '' }: CountryFlagsProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    const detectCountries = async () => {
      if (!managerNames || managerNames.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/leagues/${leagueId}/countries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ managerNames })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.countries) {
            setCountries(result.data.countries);
          } else if (result.fallback?.countries) {
            setCountries(result.fallback.countries);
          }
        }
      } catch (error) {
        console.warn('Country detection failed:', error);
        // Set fallback
        setCountries([
          {
            country: "International",
            countryCode: "INT", 
            flag: "🌍",
            managers: managerNames,
            confidence: 50
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountries();
  }, [leagueId, managerNames]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-400 animate-spin" />
        <span className="text-xs text-gray-500">Detecting countries...</span>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500">International League</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="text-xs text-gray-600 font-medium">
          {countries.length} {countries.length === 1 ? 'Country' : 'Countries'}:
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {countries.map((country) => (
          <div
            key={country.countryCode}
            className="relative"
            onMouseEnter={() => setShowTooltip(country.countryCode)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              className="text-lg hover:scale-110 transition-transform cursor-pointer"
              title={`${country.country} (${country.managers.length} ${country.managers.length === 1 ? 'manager' : 'managers'})`}
            >
              {country.flag}
            </button>
            
            {/* Tooltip */}
            {showTooltip === country.countryCode && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{country.country}</div>
                  <div className="text-gray-300">
                    {country.managers.length} {country.managers.length === 1 ? 'manager' : 'managers'}
                  </div>
                  {country.managers.length <= 3 && (
                    <div className="text-gray-400 text-xs mt-1">
                      {country.managers.join(', ')}
                    </div>
                  )}
                  {country.confidence < 70 && (
                    <div className="text-yellow-400 text-xs">
                      ~{country.confidence}% confidence
                    </div>
                  )}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {countries.length > 5 && (
        <span className="text-xs text-gray-500">
          +{countries.length - 5} more
        </span>
      )}
    </div>
  );
}