// Rule-based country detection utility
export interface CountryMapping {
  country: string;
  countryCode: string;
  flag: string;
  confidence: number;
}

// Country mapping for FPL regions and rule-based detection
const COUNTRY_MAPPINGS: { [key: string]: CountryMapping } = {
  // Direct FPL region mappings
  'Malaysia': { country: 'Malaysia', countryCode: 'MY', flag: '🇲🇾', confidence: 95 },
  'Singapore': { country: 'Singapore', countryCode: 'SG', flag: '🇸🇬', confidence: 95 },
  'Indonesia': { country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', confidence: 95 },
  'Thailand': { country: 'Thailand', countryCode: 'TH', flag: '🇹🇭', confidence: 95 },
  'Philippines': { country: 'Philippines', countryCode: 'PH', flag: '🇵🇭', confidence: 95 },
  'India': { country: 'India', countryCode: 'IN', flag: '🇮🇳', confidence: 95 },
  'Bangladesh': { country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', confidence: 95 },
  'Pakistan': { country: 'Pakistan', countryCode: 'PK', flag: '🇵🇰', confidence: 95 },
  'Sri Lanka': { country: 'Sri Lanka', countryCode: 'LK', flag: '🇱🇰', confidence: 95 },
  'United Kingdom': { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', confidence: 95 },
  'Ireland': { country: 'Ireland', countryCode: 'IE', flag: '🇮🇪', confidence: 95 },
  'Australia': { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', confidence: 95 },
  'New Zealand': { country: 'New Zealand', countryCode: 'NZ', flag: '🇳🇿', confidence: 95 },
  'South Africa': { country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', confidence: 95 },
  'Nigeria': { country: 'Nigeria', countryCode: 'NG', flag: '🇳🇬', confidence: 95 },
  'Ghana': { country: 'Ghana', countryCode: 'GH', flag: '🇬🇭', confidence: 95 },
  'Kenya': { country: 'Kenya', countryCode: 'KE', flag: '🇰🇪', confidence: 95 },
  'United States': { country: 'United States', countryCode: 'US', flag: '🇺🇸', confidence: 95 },
  'Canada': { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', confidence: 95 },
  'United Arab Emirates': { country: 'UAE', countryCode: 'AE', flag: '🇦🇪', confidence: 95 },
  'Saudi Arabia': { country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', confidence: 95 },
  'Egypt': { country: 'Egypt', countryCode: 'EG', flag: '🇪🇬', confidence: 95 },
  'Turkey': { country: 'Turkey', countryCode: 'TR', flag: '🇹🇷', confidence: 95 },
  'Germany': { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', confidence: 95 },
  'France': { country: 'France', countryCode: 'FR', flag: '🇫🇷', confidence: 95 },
  'Spain': { country: 'Spain', countryCode: 'ES', flag: '🇪🇸', confidence: 95 },
  'Italy': { country: 'Italy', countryCode: 'IT', flag: '🇮🇹', confidence: 95 },
  'Netherlands': { country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', confidence: 95 },
  'Belgium': { country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', confidence: 95 },
  'Portugal': { country: 'Portugal', countryCode: 'PT', flag: '🇵🇹', confidence: 95 },
  'Norway': { country: 'Norway', countryCode: 'NO', flag: '🇳🇴', confidence: 95 },
  'Sweden': { country: 'Sweden', countryCode: 'SE', flag: '🇸🇪', confidence: 95 },
  'Denmark': { country: 'Denmark', countryCode: 'DK', flag: '🇩🇰', confidence: 95 },
  'Japan': { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', confidence: 95 },
  'South Korea': { country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', confidence: 95 },
  'China': { country: 'China', countryCode: 'CN', flag: '🇨🇳', confidence: 95 },
  'Brazil': { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', confidence: 95 },
  'Argentina': { country: 'Argentina', countryCode: 'AR', flag: '🇦🇷', confidence: 95 },
  'Mexico': { country: 'Mexico', countryCode: 'MX', flag: '🇲🇽', confidence: 95 },
};

// Name pattern rules for fallback detection
const NAME_PATTERNS = [
  // Malaysian patterns (expanded to match the names we see)
  { patterns: [/bin |binti |abdul|mohd|muhammad|ahmad|hassan|ibrahim|rahman|aziz|shah|zahimi|nabeyl|razman|haziq|samsudin|mu'az|pejuang|sani|meor|bidin|zaifa|mokhtar|tatz|nasir|kamaludin|aiman|azri|mat|arep|pak|dan/i], country: 'Malaysia', confidence: 85 },
  // Indian patterns (including South Indian names)
  { patterns: [/kumar|sharma|patel|singh|gupta|agarwal|reddy|nair|pillai|iyer|kumarentran|sundra|pandian|krishna|raj|raman|subra/i], country: 'India', confidence: 80 },
  // Indonesian patterns  
  { patterns: [/sitepu|budi|andi|reza|indra|putra|sari|dewi|wijaya|rahman|sari|yoga|agung|bambang/i], country: 'Indonesia', confidence: 75 },
  // Arabic/Middle Eastern patterns
  { patterns: [/al-|bin |abd|omar|ahmed|mohamed|hassan|ali|khalil|said|ammar|yusuf|omar|farid/i], country: 'UAE', confidence: 70 },
  // British patterns
  { patterns: [/smith|jones|brown|williams|taylor|davies|evans|wilson|thomas|johnson|branko|joe|cruz/i], country: 'United Kingdom', confidence: 60 },
  // European patterns
  { patterns: [/berg|son$|sen$|sson$|nielsen|andersen/i], country: 'Norway', confidence: 65 },
  { patterns: [/van |de |der |burg|hoek|berg$/i], country: 'Netherlands', confidence: 65 },
  { patterns: [/ovic$|ovski$|ski$|czyk$/i], country: 'Poland', confidence: 65 },
];

export function detectCountriesFromManagers(managers: Array<{ name: string; region?: string }>): Array<{
  country: string;
  countryCode: string; 
  flag: string;
  managers: string[];
  confidence: number;
}> {
  const countryGroups: { [key: string]: { managers: string[]; totalConfidence: number; count: number } } = {};

  managers.forEach(manager => {
    let detected: CountryMapping | null = null;
    
    // First, try using FPL region data
    if (manager.region && COUNTRY_MAPPINGS[manager.region]) {
      detected = COUNTRY_MAPPINGS[manager.region];
    } else {
      // Fallback to name pattern matching
      for (const rule of NAME_PATTERNS) {
        if (rule.patterns.some(pattern => pattern.test(manager.name))) {
          const countryData = COUNTRY_MAPPINGS[rule.country];
          if (countryData) {
            detected = { ...countryData, confidence: rule.confidence };
            break;
          }
        }
      }
    }

    // Use fallback if no match
    if (!detected) {
      detected = { country: 'International', countryCode: 'INT', flag: '🌍', confidence: 50 };
    }

    const key = detected.country;
    if (!countryGroups[key]) {
      countryGroups[key] = { managers: [], totalConfidence: 0, count: 0 };
    }
    
    countryGroups[key].managers.push(manager.name);
    countryGroups[key].totalConfidence += detected.confidence;
    countryGroups[key].count += 1;
  });

  // Convert to final format
  return Object.entries(countryGroups).map(([country, data]) => {
    const mapping = COUNTRY_MAPPINGS[country] || { country, countryCode: 'INT', flag: '🌍', confidence: 50 };
    return {
      country,
      countryCode: mapping.countryCode,
      flag: mapping.flag,
      managers: data.managers,
      confidence: Math.round(data.totalConfidence / data.count)
    };
  }).sort((a, b) => b.managers.length - a.managers.length); // Sort by number of managers
}

// Get country-specific football references and slang
export function getCountryFootballCulture(country: string): {
  culturalContext: string;
  footballSlang: string[];
  references: string[];
} {
  const cultures: { [key: string]: any } = {
    'Malaysia': {
      culturalContext: 'Malaysian football passion with Southeast Asian enthusiasm',
      footballSlang: ['lah', 'wei', 'solid', 'power', 'shiok', 'steady'],
      references: ['Harimau Malaya', 'Super League', 'FAM Cup', 'Ultras Malaya']
    },
    'Indonesia': {
      culturalContext: 'Indonesian football fever with Garuda pride',
      footballSlang: ['mantap', 'keren', 'gokil', 'juara', 'hebat'],
      references: ['Garuda', 'Liga 1', 'Persija', 'Persib', 'The Jakmania']
    },
    'Singapore': {
      culturalContext: 'Singaporean football passion with Lion City pride',
      footballSlang: ['steady lah', 'power', 'shiok', 'solid', 'confirm'],
      references: ['Lions', 'S-League', 'National Stadium', 'Kallang Roar']
    },
    'India': {
      culturalContext: 'Indian football enthusiasm with cricket-mad nation discovering the beautiful game',
      footballSlang: ['fantastic', 'brilliant', 'superb', 'outstanding', 'tremendous'],
      references: ['ISL', 'Bengaluru FC', 'East Bengal', 'Mohun Bagan', 'Blue Tigers']
    },
    'United Kingdom': {
      culturalContext: 'British football culture with proper pub banter',
      footballSlang: ['blimey', 'brilliant', 'proper', 'mental', 'class', 'gutted'],
      references: ['Premier League', 'Championship', 'FA Cup', 'Three Lions', 'Wembley']
    },
    'Australia': {
      culturalContext: 'Australian football passion with Socceroos pride',
      footballSlang: ['ripper', 'beauty', 'mate', 'bloody hell', 'fair dinkum'],
      references: ['Socceroos', 'A-League', 'FFA Cup', 'Adelaide United', 'Victory']
    }
  };

  return cultures[country] || {
    culturalContext: 'International football community with global passion',
    footballSlang: ['amazing', 'incredible', 'fantastic', 'brilliant', 'outstanding'],
    references: ['Premier League', 'Champions League', 'World Cup', 'FIFA', 'UEFA']
  };
}