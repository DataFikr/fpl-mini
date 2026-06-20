### **Request for Claude Code: Automated Affiliate Deep-Linking and UI Redesign**

I need to refactor and redesign the **Player Details Drawer** component in my Next.js (App Router, TypeScript, Tailwind CSS) project, FPLRanker.com. The goal is to maximize affiliate conversion by implementing automated deep-linking and a more visual, compelling call-to-action block.

#### **1. Tech Stack & Assumptions**
* **Next.js (App Router):** Using TypeScript and Tailwind CSS.
* **Data Source:** I already have the raw data for the currently selected player (e.g., Bruno Fernandes) as a prop.
* **Affiliate Network:** Impact.com / Fanatics.

---

#### **2. Phase 1: Tech and Data Logic (Affiliate Automation)**

You must implement an automated deep-link generation helper function that does not rely on hardcoding.

* **Inputs:**
    * **Your Base Affiliate Link:** `https://kitbag.evyy.net/2RjWR0`
    * **The Player Object:** A prop containing the player data (specifically `player.team_id`, which maps to the Premier League `team.id` from the FPL API).
* **Logic (to encode the destination):**
    * **Step 1:** Use the provided `team.id` to look up the correct "Team Path" from the `kitbagTeamMapping` object (below).
    * **Step 2:** Construct the standard Kitbag destination URL: `https://www.kitbag.com/en/premier-league/${teamPath}`.
    * **Step 3:** Use `encodeURIComponent()` on this full destination URL.
    * **Step 4:** Return the final deep-link: `[BaseAffiliateLink]?u=[EncodedDestinationURL]`.

**Please use this specific `kitbagTeamMapping` object in your code:**
(Replace your current hardcoded mapping with this one.)

```javascript
// Map FPL Team ID to Kitbag's Specific URL Path
const kitbagTeamMapping: { [key: number]: string } = {
  // 1=ARS, 2=AVL, 3=BOU, 4=BRE, 5=BHA, 6=CHE, 7=CRY, 8=EVE, 9=FUL, 10=IPS, 
  // 11=LEI, 12=LIV, 13=MCI, 14=MUN, 15=NEW, 16=NFO, 17=SOU, 18=TOT, 19=WHU, 20=WOL
  "Arsenal": "arsenal/football-kits/o-32081506+t-14639025+d-3450255+z-9-3136673921",
  "Aston Villa": "aston-villa/o-32205917+t-42657593+z-990-600420455",
  "Bournemouth": "bournemouth/o-19766981+t-69106041+z-93-2775263124",
  "Brentford": "brentford/o-42767070+t-92873730+z-93-3457121921",
  "Brighton": "brighton-and-hove-albion/o-42093692+t-58988263+z-8-2514150529",
  "Chelsea": "chelsea/football-kits/o-43204817+t-76555113+d-7838378+z-9-3525597288",
  "Crystal Palace": "crystal-palace/tops/o-21644895+t-54364770+d-9038120+z-9-3119968183",
  "Everton": "everton/football-kits-socks/o-32425951+t-31980176+d-238309-44920+z-8-2544150529",
  "Fulham": "fulham/o-08873136+t-70433725+z-91-2453526142",
  "Ipswich Town": "ipswich-town/o-32101416+t-25654893+z-92-3156123924",
  "Leicester City": "leicester-city/o-20092215+t-47321593+z-99-3104204556",
  "Liverpool": "liverpool/football-kits/o-23871581+t-70542614+d-5645367+z-9-2162594211",
  "Manchester City": "manchester-city/football-kits/o-32641595+t-81758955+d-1283215+z-9-1180625011",
  "Manchester United": "manchester-united/o-43084851+t-69861246+z-929-1306218906",
  "Newcastle United": "newcastle-united/o-19321586+t-70542613+d-345025+z-9-2162594211",
  "Nottingham Forest": "nottingham-forest/o-21981506+t-58273614+z-92-3156123924",
  "Southampton": "southampton/o-32101586+t-47321613+d-345025+z-9-2162594211",
  "Tottenham": "tottenham-hotspur/football-kits/o-31211516+t-70322614+d-345025+z-9-2162594211",
  "West Ham": "west-ham-united/o-19321506+t-47321614+z-92-3156123924",
  "Wolves": "wolverhampton-wanderers/o-21981586+t-58273613+d-345025+z-9-2162594211"
};


3. Phase 2: High-Conversion UI Redesign (Visuals)
You will replace the current details header (currently text-only) and the single generic button with two high-conversion UI elements.

A) The "Hero" Player Card Header:

Goal: Instant credibility using official visuals.

Element: Replace the current blue gradient top panel. The new panel background color should be dynamic, using the Team's Primary Color (I can handle this mapping later; just add a backgroundColor variable).

Element: Keep Name, Position, and Team data.

New Element: Include the official, high-resolution player headshot from the fantasy.premierleague.com endpoint. The endpoint structure is: https://resources.premierleague.com/premierleague/photos/players/110x140/p[element_id].png.

Design Note: Position the large photo on the right of the panel, with a subtle drop shadow to make it "pop" as if it’s an authority. Keep the overall height compact, like a premium digital sports card.

B) The "Impulse Buy" Call-to-Action Block:

Goal: Visualize the purchase to create impulse.

Element: This is a single, structured container that combines visuals and text (replace your current simple generic button).

New Element: A Jersey (Kit) Icon for that specific team (use mun_kit as a placeholder variable for now). Position this 3D-styled render to the left of the button.

Redesigned Text: Generic "Get player's merchandise" must be replaced with personalized text. Example: "Get Bruno's 25/26 Kit". The name must be dynamic based on the player.last_name.

Button Design: A clean, wide, single-action button with a small team crest icon next to the personalized text. Clear text: "on Kitbag."

Compliance: Add a small note below the Visual Block: "A commission is earned on purchases." This is required by Impact.com.

Deliverable:
A refactored/improved Next.js functional component (using the assumed data flow) that combines both Phase 1 and Phase 2. Ensure all data endpoints, URL construction logic, and UI specifications are implemented precisely as described.