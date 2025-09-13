import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/services/team-service';
import { detectCountriesFromManagers } from '@/utils/country-detection';

interface CountryDetectionResult {
  countries: Array<{
    country: string;
    countryCode: string;
    flag: string;
    managers: string[];
    confidence: number;
  }>;
  totalManagers: number;
  uniqueCountries: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { managerNames } = await request.json();
    
    if (!managerNames || managerNames.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No manager names provided'
      });
    }

    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    
    // Fetch detailed manager data with regions from FPL API
    const teamService = new TeamService();
    let managersWithRegions: Array<{ name: string; region?: string }> = [];
    
    try {
      // Get full league data to extract manager regions
      const leagueData = await teamService.syncLeagueData(leagueId);
      
      // Map manager names to their regions from FPL API data
      managersWithRegions = managerNames.map((name: string) => {
        const team = leagueData.standings.find((t: any) => t.managerName === name);
        return {
          name,
          region: team?.player_region_name || undefined
        };
      });
      
      console.log(`Country detection: Found ${managersWithRegions.filter(m => m.region).length}/${managersWithRegions.length} managers with region data`);
    } catch (error) {
      console.warn('Failed to fetch FPL region data, using rule-based detection:', error);
      // Fallback to names only
      managersWithRegions = managerNames.map((name: string) => ({ name }));
    }

    // Use our rule-based detection system
    const countries = detectCountriesFromManagers(managersWithRegions);

    const result: CountryDetectionResult = {
      countries,
      totalManagers: managerNames.length,
      uniqueCountries: countries.length
    };

    return NextResponse.json({
      success: true,
      data: result,
      method: 'fpl_region_and_rules',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error detecting countries:', error);
    
    // Fallback response using pure rule-based detection
    try {
      const managersWithRegions = (request.body as any).managerNames?.map((name: string) => ({ name })) || [];
      const countries = detectCountriesFromManagers(managersWithRegions);
      
      return NextResponse.json({
        success: true,
        data: {
          countries,
          totalManagers: managersWithRegions.length,
          uniqueCountries: countries.length
        },
        method: 'rules_only_fallback',
        generatedAt: new Date().toISOString()
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to detect countries',
        fallback: {
          countries: [
            {
              country: "International",
              countryCode: "INT",
              flag: "🌍",
              managers: [],
              confidence: 50
            }
          ],
          totalManagers: 0,
          uniqueCountries: 1
        }
      });
    }
  }
}