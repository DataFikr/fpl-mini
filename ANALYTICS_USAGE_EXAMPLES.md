# Analytics Usage Examples for FPL Ranker

This document shows how to use the analytics tracking utilities throughout your application.

## Import the Analytics Library

```typescript
import { analytics } from '@/lib/analytics';
```

## Common Use Cases

### 1. Track League Views

When a user views a league page:

```typescript
// In your league page component
'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function LeaguePage({ leagueId, leagueName }) {
  useEffect(() => {
    // Track when league is viewed
    analytics.trackLeagueView(leagueId, leagueName);
  }, [leagueId, leagueName]);

  return (
    <div>
      {/* Your league content */}
    </div>
  );
}
```

### 2. Track Newsletter Subscriptions

In your newsletter component (already implemented):

```typescript
// In enhanced-league-storytelling.tsx or newsletter form
const handleSubscribe = async (email: string) => {
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, leagueId, gameweek }),
    });

    if (response.ok) {
      // Track successful subscription
      analytics.trackNewsletterSubscribe(email);
      analytics.trackConversion('newsletter_signup');
      setShowSuccess(true);
    }
  } catch (error) {
    analytics.trackError('newsletter_subscribe', error.message);
  }
};
```

### 3. Track Gameweek Changes

When user changes gameweek:

```typescript
// In your gameweek selector component
const handleGameweekChange = (newGameweek: number) => {
  setGameweek(newGameweek);

  // Track gameweek change
  analytics.trackGameweekChange(newGameweek);
};
```

### 4. Track Team Comparisons

When comparing teams:

```typescript
// In comparison modal or feature
const compareTeams = (team1Id: string, team2Id: string) => {
  analytics.trackTeamComparison(team1Id, team2Id);

  // Show comparison UI
  setShowComparison(true);
};
```

### 5. Track Search Queries

In your search component:

```typescript
const handleSearch = (query: string) => {
  const results = performSearch(query);

  // Track search
  analytics.trackSearch(query, results.length);
};
```

### 6. Track Feature Usage

Track when users use specific features:

```typescript
// Bump Chart view
const showBumpChart = () => {
  analytics.trackFeatureUse('bump_chart', {
    gameweek: currentGameweek,
    league_size: teams.length
  });
  setChartVisible(true);
};

// Pitch view modal
const openPitchView = (teamId: string) => {
  analytics.trackFeatureUse('pitch_view', {
    team_id: teamId,
    gameweek: currentGameweek
  });
  setShowPitchModal(true);
};

// Squad analysis
const viewSquadAnalysis = () => {
  analytics.trackFeatureUse('squad_analysis', {
    league_id: leagueId
  });
};
```

### 7. Track Social Shares

When users share content:

```typescript
const shareOnTwitter = () => {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  // Track share
  analytics.trackShare('twitter', 'league_stats');

  window.open(tweetUrl, '_blank');
};

const shareOnWhatsApp = () => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  analytics.trackShare('whatsapp', 'gameweek_summary');

  window.open(whatsappUrl, '_blank');
};
```

### 8. Track Errors

Track errors for debugging:

```typescript
try {
  const data = await fetchLeagueData(leagueId);
} catch (error) {
  // Track error
  analytics.trackError('league_data_fetch', error.message);

  // Show error to user
  setError('Failed to load league data');
}
```

### 9. Track User Engagement

Track how long users spend on different sections:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export default function HeadlinesSection() {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const startTime = startTimeRef.current;

    return () => {
      // Track engagement time when component unmounts
      const engagementTime = Math.floor((Date.now() - startTime) / 1000);

      if (engagementTime > 5) { // Only track if user spent 5+ seconds
        analytics.trackEngagement('headlines', 'view', engagementTime);
      }
    };
  }, []);

  return (
    <div>
      {/* Headlines content */}
    </div>
  );
}
```

### 10. Track Button Clicks

Track important button interactions:

```typescript
const handleGetStarted = () => {
  analytics.trackEvent('get_started_click', {
    source: 'landing_page',
    section: 'hero'
  });

  // Navigate to league search
  router.push('/search');
};
```

---

## Complete Example: Enhanced League Page

Here's a complete example integrating multiple analytics events:

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export default function EnhancedLeaguePage({
  leagueId,
  leagueName,
  initialGameweek
}) {
  const [gameweek, setGameweek] = useState(initialGameweek);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  // Track page view
  useEffect(() => {
    analytics.trackLeagueView(leagueId, leagueName);

    // Track engagement time on unmount
    return () => {
      const engagementTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      analytics.trackEngagement('league_page', 'view', engagementTime);
    };
  }, [leagueId, leagueName]);

  // Track gameweek changes
  const handleGameweekChange = (newGameweek: number) => {
    setGameweek(newGameweek);
    analytics.trackGameweekChange(newGameweek);
  };

  // Track team comparisons
  const handleCompareTeams = (team1: string, team2: string) => {
    analytics.trackTeamComparison(team1, team2);
    setSelectedTeams([team1, team2]);
  };

  // Track feature usage
  const showBumpChart = () => {
    analytics.trackFeatureUse('bump_chart', {
      gameweek,
      league_id: leagueId
    });
  };

  const shareResults = (platform: string) => {
    analytics.trackShare(platform, 'league_standings');
    // Share logic...
  };

  return (
    <div>
      {/* Your league page content */}
      <button onClick={() => handleGameweekChange(gameweek + 1)}>
        Next Gameweek
      </button>

      <button onClick={showBumpChart}>
        View Progression Chart
      </button>

      <button onClick={() => shareResults('twitter')}>
        Share on Twitter
      </button>
    </div>
  );
}
```

---

## Testing Analytics Events

### In Development

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `window.dataLayer`
4. You should see an array of events
5. When you trigger an event, it will be pushed to this array

### In Production

1. Open browser DevTools
2. Go to **Network** tab
3. Filter by "google-analytics.com" or "gtag"
4. Trigger an event in your app
5. You should see network requests being sent

### In Google Analytics Dashboard

1. Go to [Google Analytics](https://analytics.google.com)
2. Reports → Realtime → Events
3. Trigger an event on your site
4. It should appear within 30 seconds

---

## Best Practices

### ✅ DO:
- Track meaningful user interactions
- Use consistent event naming (snake_case)
- Include relevant context in event parameters
- Track conversions (newsletter signups, feature usage)
- Track errors for debugging

### ❌ DON'T:
- Track personally identifiable information (PII)
- Track every single click (focus on important actions)
- Send sensitive data (passwords, tokens, etc.)
- Track too frequently (debounce rapid events)

---

## Event Naming Conventions

Follow these patterns for consistency:

```typescript
// Feature usage
analytics.trackFeatureUse('feature_name', { params });

// User actions
analytics.trackEvent('action_name', { params });

// Conversions
analytics.trackConversion('conversion_type', value);

// Errors
analytics.trackError('error_context', 'error_message');
```

**Examples**:
- `view_league` ✅
- `change_gameweek` ✅
- `compare_teams` ✅
- `newsletter_subscribe` ✅
- `share_twitter` ❌ (use `trackShare('twitter', 'content_type')` instead)

---

## Viewing Your Custom Events

1. Go to Google Analytics
2. **Reports** → **Engagement** → **Events**
3. Click on any event to see details
4. View parameters by clicking "Event name" then scrolling to parameters

---

## Setting Up Conversions

Once you have events tracking, mark important ones as conversions:

1. Go to **Admin** → **Events**
2. Toggle "Mark as conversion" for:
   - `newsletter_subscribe`
   - `league_view` (if you consider this a goal)
   - Any custom conversion events

3. Go to **Reports** → **Conversions** to see conversion metrics

---

## Questions?

Refer to the [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) for setup instructions.
