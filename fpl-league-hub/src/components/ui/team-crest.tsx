'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface TeamCrestProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  autoGenerate?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function TeamCrest({ 
  teamName, 
  size = 'md', 
  className = '',
  autoGenerate = false 
}: TeamCrestProps) {
  const [crestUrl, setCrestUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCrest = async () => {
      try {
        const response = await fetch(`/api/crests?teamName=${encodeURIComponent(teamName)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.crestUrl) {
            setCrestUrl(data.crestUrl);
            return;
          }
        }

        if (autoGenerate) {
          await generateCrest();
        } else {
          // Use fallback
          setCrestUrl(generateFallbackCrest(teamName));
        }
      } catch (err) {
        console.error('Error fetching crest:', err);
        setCrestUrl(generateFallbackCrest(teamName));
      }
    };

    fetchCrest();
  }, [teamName, autoGenerate]);

  const generateCrest = async () => {
    try {
      setIsGenerating(true);
      setError(false);
      
      const response = await fetch('/api/crests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      if (response.ok) {
        const data = await response.json();
        setCrestUrl(data.crestUrl);
      } else {
        throw new Error('Failed to generate crest');
      }
    } catch (err) {
      console.error('Error generating crest:', err);
      setError(true);
      setCrestUrl(generateFallbackCrest(teamName));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCrest = (name: string): string => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);

    const colors = [
      '#8b5cf6', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b',
      '#ec4899', '#10b981', '#f97316', '#6366f1', '#84cc16'
    ];
    
    const colorIndex = name.length % colors.length;
    const bgColor = colors[colorIndex];
    
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="95" fill="${bgColor}" stroke="#ffffff" stroke-width="10"/>
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" font-weight="bold" 
              text-anchor="middle" fill="#ffffff">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  if (isGenerating) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-full flex items-center justify-center`}>
        <div className="animate-spin rounded-full border-2 border-purple-500 border-t-transparent w-6 h-6"></div>
      </div>
    );
  }

  if (error && !crestUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-full flex items-center justify-center`}>
        <Shield className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
      {crestUrl ? (
        <img
          src={crestUrl}
          alt={`${teamName} crest`}
          className="w-full h-full object-cover"
          onError={() => {
            setError(true);
            setCrestUrl(generateFallbackCrest(teamName));
          }}
        />
      ) : (
        <Shield className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
}