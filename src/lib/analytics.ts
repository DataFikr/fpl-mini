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

/**
 * Event-parameter names GA4 reserves for traffic attribution.
 *
 * Sending one of these on a *custom* event does not record a dimension — it
 * rewrites that session's acquisition source. `subscribe_newsletter` and
 * `share_league` were passing `source: 'header' | 'banner' | 'headline_modal'`,
 * so GA4's August 2026 report showed 27 sessions arriving from a "banner" and
 * lost where those users actually came from. Since the affected events are the
 * conversions (subscribes and shares), it destroyed attribution on exactly the
 * sessions worth understanding.
 *
 * Use `placement` for where-in-the-UI something happened — the convention the
 * rest of the file already follows (`affiliate_click`, `video_play`,
 * `premium_gate_click`, `capture_dismiss`).
 */
const RESERVED_GA4_PARAMS = new Set([
  'source', 'medium', 'campaign', 'campaign_id', 'term', 'content',
  'gclid', 'dclid', 'srsltid',
]);

/**
 * Drops reserved names before they reach gtag. Losing one custom parameter is
 * strictly better than corrupting the session's acquisition data, which is why
 * this strips rather than renames; the dev warning names the offending event so
 * the call site gets fixed properly.
 */
const stripReservedParams = (
  eventName: string,
  params?: Record<string, any>
): Record<string, any> | undefined => {
  if (!params) return params;
  const clean: Record<string, any> = {};
  const dropped: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED_GA4_PARAMS.has(key)) dropped.push(key);
    else clean[key] = value;
  }
  if (dropped.length && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[analytics] "${eventName}" dropped reserved GA4 param(s): ${dropped.join(', ')}. ` +
      'These overwrite session attribution — use "placement" instead.'
    );
  }
  return clean;
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('event', eventName, stripReservedParams(eventName, eventParams));
    }
  }
};

/**
 * The four events that must be marked as **key events** in the GA4 console
 * (Admin → Data display → Events → "Mark as key event"). Marking cannot be done
 * from code, so this list is the contract between the app and the property —
 * see docs/marketing/ga4-key-events.md for the console steps.
 *
 * The Sep 2026 diagnostic found `Key events: 0` against £0 revenue: nothing
 * after `page_view` was measurable, so no funnel step could be shown to have
 * worked or failed. Each name below is the step it makes visible.
 *
 * `sign_up` and `begin_checkout` use GA4's *recommended* names rather than the
 * prose names in the diagnostic ("signup", "checkout") because recommended
 * names unlock GA4's built-in funnel and monetisation reports; custom spellings
 * would only ever appear as unlabelled custom events.
 */
export const KEY_EVENTS = [
  'sign_up',            // magic-link requested — visitor becomes a lead
  'premium_gate_click', // premium reached — the paywall discovery step
  'affiliate_click',    // Kitbag outbound — the only live revenue path today
  'begin_checkout',     // hosted checkout opened — intent to pay
] as const;

/**
 * GA4's client id, read from the `_ga` cookie (`GA1.1.<client>.<ts>`).
 *
 * Needed to stitch a server-side purchase back to the browsing session that
 * produced it: the Lemon Squeezy webhook fires with no cookies, so without this
 * carried through the checkout URL any future purchase event would land as a
 * brand-new user and lose its acquisition channel. Returns null before gtag has
 * set the cookie, in which case checkout proceeds untagged rather than blocked.
 */
export const gaClientId = (): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/);
  return m ? m[1] : null;
};

/**
 * Track a magic-link sign-in request — fired once the request succeeds, so it
 * counts intent that actually produced an email rather than every submit press.
 *
 * The login page previously fired no analytics at all, which is why account
 * conversion could only be reconstructed by hand from the Resend export.
 * `method` matches GA4's recommended parameter for `sign_up`.
 */
export const trackSignup = (placement: string) => {
  trackEvent('sign_up', { method: 'magic_link', placement });
};

/**
 * Track a click that sends the user to /premium.
 *
 * Centralised because the event previously lived inline in one component
 * (PredictionBlock) whose gate cannot render during the free-launch window, so
 * the event was structurally incapable of firing. Every route into /premium
 * should call this so paywall discovery is measurable regardless of which
 * surface the user came from.
 */
export const trackPremiumGateClick = (placement: string, feature?: string) => {
  trackEvent('premium_gate_click', { placement, feature });
};

/**
 * Track the hosted-checkout open. GA4 ecommerce shape (`value`, `currency`,
 * `items`) so it feeds the standard monetisation reports rather than sitting as
 * an opaque custom event.
 */
export const trackBeginCheckout = (
  plan: 'season' | 'annual',
  value: number,
  currency = 'GBP'
) => {
  trackEvent('begin_checkout', {
    currency,
    value,
    items: [{ item_id: plan, item_name: `FPL Ranker Premium — ${plan}`, price: value, quantity: 1 }],
  });
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

  // Track newsletter subscriptions.
  //
  // Emits `subscribe_newsletter`, matching what CaptureCard and SubscribeButton
  // already fire. This helper previously sent `newsletter_subscribe` — the same
  // two words reversed — so any call site using it would have split the metric
  // across two GA4 event names that look identical in a list and never sum.
  // It takes no email: an address is PII and GA4 must not receive one.
  trackNewsletterSubscribe: (placement = 'website_form') => {
    trackEvent('subscribe_newsletter', { placement });
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
