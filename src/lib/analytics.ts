// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('event', eventName, eventParams);
    }
  }
};

/**
 * Track an outbound click on a monetised affiliate link (Kitbag/Impact).
 *
 * Previously affiliate anchors fired no analytics at all, so GA4 showed zero
 * affiliate activity regardless of real clicks — the "zero conversions in 8
 * months" was partly a measurement gap. Every affiliate anchor now routes
 * through <AffiliateLink> which calls this. Mark `affiliate_click` as a key
 * event in GA4 and reconcile counts against the Impact dashboard (subId1/2).
 */
export const trackAffiliateClick = (
  placement: string,
  item?: string,
  url?: string
) => {
  trackEvent('affiliate_click', {
    affiliate: 'kitbag',
    placement,
    item,
    link_url: url,
  });
};

// Track page views manually (useful for SPAs)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: url,
      });
    }
  }
};

// Common FPL-specific event tracking functions
export const analytics = {
  // Track league views
  trackLeagueView: (leagueId: string, leagueName?: string) => {
    trackEvent('view_league', {
      league_id: leagueId,
      league_name: leagueName,
    });
  },

  // Track newsletter subscriptions
  trackNewsletterSubscribe: (email: string) => {
    trackEvent('newsletter_subscribe', {
      method: 'website_form',
    });
  },

  // Track gameweek changes
  trackGameweekChange: (gameweek: number) => {
    trackEvent('change_gameweek', {
      gameweek: gameweek,
    });
  },

  // Track team comparisons
  trackTeamComparison: (team1Id: string, team2Id: string) => {
    trackEvent('compare_teams', {
      team_1: team1Id,
      team_2: team2Id,
    });
  },

  // Track search queries
  trackSearch: (searchTerm: string, resultCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  },

  // Track feature usage
  trackFeatureUse: (featureName: string, details?: Record<string, any>) => {
    trackEvent('use_feature', {
      feature_name: featureName,
      ...details,
    });
  },

  // Track social shares
  trackShare: (platform: string, contentType: string) => {
    trackEvent('share', {
      method: platform,
      content_type: contentType,
    });
  },

  // Track errors for debugging
  trackError: (errorName: string, errorMessage: string) => {
    trackEvent('exception', {
      description: `${errorName}: ${errorMessage}`,
      fatal: false,
    });
  },

  // Track user engagement time
  trackEngagement: (eventCategory: string, eventAction: string, value?: number) => {
    trackEvent('engagement', {
      event_category: eventCategory,
      event_action: eventAction,
      value: value,
    });
  },

  // Track conversions (e.g., newsletter signup, league join)
  trackConversion: (conversionType: string, value?: number) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value: value,
    });
  },
};
