import requests
import pandas as pd
import time
import json
import matplotlib.pyplot as plt
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import textwrap # Import for text wrapping

# --- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MINI-LEAGUE ID ---
LEAGUE_ID = 496202 # Example ID - You MUST change this to your league's ID!
# ---------------------------------------------------------------

# Configure retry strategy for network requests
retry_strategy = Retry(
    total=5,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["HEAD", "GET", "OPTIONS"]
)

# Create an HTTP session and mount the retry adapter
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)
http.mount("http://", adapter)


def get_global_player_data():
    """
    Fetches the global FPL 'bootstrap-static' data to get player names, IDs, and positions.
    Returns a dictionary mapping player ID (element) to their web_name and position type.
    """
    url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    print(f"Attempting to fetch global player data from: {url}")
    try:
        response = http.get(url, timeout=(10, 20), verify=False)
        response.raise_for_status()
        data = response.json()
        
        # Map element_type ID to position string (e.g., 1 to 'GKP')
        element_type_map = {
            element_type['id']: element_type['singular_name_short']
            for element_type in data['element_types']
        }

        player_map = {
            player['id']: {
                'web_name': player['web_name'],
                'element_type_id': player['element_type'], # Store ID
                'element_type_name': element_type_map.get(player['element_type'], 'Unknown') # Store Name
            }
            for player in data['elements']
        }
        print(f"Fetched {len(player_map)} global players.")
        return player_map
    except requests.exceptions.RequestException as e:
        print(f"Error fetching global player data: {e}")
        return {}

def get_gameweek_live_data(gameweek_id):
    """
    Fetches live data for a specific gameweek to get individual player points for that GW.
    Returns a dictionary mapping player ID to their points in that gameweek.
    """
    url = f"https://fantasy.premierleague.com/api/event/{gameweek_id}/live/"
    print(f"Attempting to fetch live gameweek {gameweek_id} data from: {url}")
    try:
        response = http.get(url, timeout=(10, 20), verify=False)
        response.raise_for_status()
        data = response.json()

        gw_player_points_map = {}
        if 'elements' in data:
            for element_data in data['elements']:
                player_id = element_data['id']
                # 'total_points' here refers to points scored *in this specific gameweek*
                points_in_gw = element_data['stats']['total_points']
                gw_player_points_map[player_id] = points_in_gw
        
        print(f"Fetched live data for {len(gw_player_points_map)} players for GW{gameweek_id}.")
        return gw_player_points_map
    except requests.exceptions.RequestException as e:
        print(f"Error fetching live gameweek {gameweek_id} data: {e}")
        return {}


def get_league_managers_info(league_id):
    """
    Fetches league standings to get manager details (id, team name, manager name, rank_sort, total points).
    """
    url = f"https://fantasy.premierleague.com/api/leagues-classic/{league_id}/standings/"
    print(f"Attempting to fetch league data from: {url}")
    try:
        response = http.get(url, timeout=(5, 10), verify=False)
        response.raise_for_status()
        data = response.json()
        
        managers_info = []
        if 'standings' in data and 'results' in data['standings']:
            for player_entry in data['standings']['results']:
                managers_info.append({
                    'id': player_entry['entry'],
                    'team_name': player_entry['entry_name'],
                    'manager_name': player_entry['player_name'],
                    'total_points': player_entry['total'],
                    'rank_sort': player_entry['rank_sort']
                })
        
        # Sort by rank_sort to ensure consistent ordering (rank 1 at top)
        managers_info = sorted(managers_info, key=lambda x: x['rank_sort'])
        print(f"Fetched {len(managers_info)} managers from league data.")
        return managers_info
    except requests.exceptions.RequestException as e:
        print(f"Error fetching league manager info: {e}")
        return []

def get_manager_history_for_gameweeks(manager_id):
    """
    Fetches a manager's history to determine the most recent active gameweek.
    Returns a dictionary mapping gameweek number to total points for that manager in that GW.
    """
    url = f"https://fantasy.premierleague.com/api/entry/{manager_id}/history/"
    try:
        response = http.get(url, timeout=(5, 10), verify=False)
        response.raise_for_status()
        data = response.json()
        
        history = {}
        if 'current' in data:
            # We need gameweek_id -> points_this_gw, not total_points (cumulative)
            # The 'current' list contains items for each gameweek played
            # Each item has 'event' (gameweek) and 'points' (points in that specific gameweek)
            history = {item['event']: item['points'] for item in data['current']}
        return history
    except requests.exceptions.RequestException as e:
        print(f"Error fetching history for manager {manager_id}: {e}")
        return {}

def get_manager_squad_for_gameweek(manager_id, gameweek_id, global_player_map, gameweek_live_points_map):
    """
    Fetches a manager's squad picks for a specific gameweek and formats the player data,
    including points for that gameweek, categorized by position.
    Returns a tuple: (formatted_squad_string, gameweek_total_points_for_manager, player_contributions)
    """
    url = f"https://fantasy.premierleague.com/api/entry/{manager_id}/event/{gameweek_id}/picks/"
    print(f"  Fetching squad for manager {manager_id} (GW{gameweek_id}) from: {url}")
    try:
        response = http.get(url, timeout=(10, 20), verify=False)
        response.raise_for_status()
        data = response.json()
        
        positions = {
            'GKP': [],
            'DEF': [],
            'MID': [],
            'FWD': [],
            'SUBS': []
        }
        
        # This will store player names and their contributions for performance analysis
        player_contributions = [] 
        
        gameweek_total_points_for_manager = 0

        if 'picks' in data:
            sorted_picks = sorted(data['picks'], key=lambda x: x['position'])

            for pick in sorted_picks:
                player_id = pick['element']
                is_on_bench = pick['position'] > 11 
                
                player_info = global_player_map.get(player_id, {})
                player_name = player_info.get('web_name', f"Unknown Player (ID:{player_id})")
                player_position_type = player_info.get('element_type_name', 'Unknown')
                
                base_points_gw = gameweek_live_points_map.get(player_id, 0)
                player_multiplier = pick['multiplier']
                player_points_contribution = base_points_gw * player_multiplier 

                designation = ""
                if pick['is_captain']:
                    designation = "(C)"
                elif pick['is_vice_captain']:
                    designation = "(VC)"
                
                formatted_player_string = f"{player_name} {designation} ({int(player_points_contribution)})".strip()

                if is_on_bench:
                    positions['SUBS'].append(formatted_player_string)
                elif player_position_type in positions:
                    positions[player_position_type].append(formatted_player_string)
                else: 
                    positions['SUBS'].append(formatted_player_string)
                
                # Store all player contributions for analysis, even if on bench
                player_contributions.append({
                    'name': player_name,
                    'points': player_points_contribution,
                    'is_captain': pick['is_captain'],
                    'is_vice_captain': pick['is_vice_captain'],
                    'is_on_bench': is_on_bench
                })
        
        # Override calculated total points with the official 'points' from entry_history if available
        if 'entry_history' in data and 'points' in data['entry_history']:
            gameweek_total_points_for_manager = data['entry_history']['points']

        formatted_squad_lines = []
        for pos_type, players_list in positions.items():
            if players_list: 
                formatted_squad_lines.append(f"{pos_type}: {', '.join(players_list)}")
        
        return "\n".join(formatted_squad_lines), int(gameweek_total_points_for_manager), player_contributions
    
    except requests.exceptions.RequestException as e:
        print(f"  Error fetching squad for manager {manager_id} GW{gameweek_id}: {e}")
        return "Error fetching squad data.", 0, []

def analyze_gameweek_performance(gw_total_points, player_contributions):
    """
    Generates a brief performance analysis for a manager's squad in a given gameweek.
    """
    analysis = []

    # Find captain performance
    captain_info = next((p for p in player_contributions if p['is_captain']), None)
    if captain_info:
        captain_points = int(captain_info['points'])
        if captain_points > 10: # Assuming a good captain score is > 10
            analysis.append(f"Kapten {captain_info['name']} ({captain_points} mata) cemerlang!")
        elif captain_points > 0:
            analysis.append(f"Kapten {captain_info['name']} ({captain_points} mata) menyumbang.")
        else:
            analysis.append(f"Kapten {captain_info['name']} kurang menyengat ({captain_points} mata).")
    else:
        analysis.append("Tiada kapten ditemui.") # Should not happen in FPL

    # Identify other top scorers (non-captain, non-bench)
    active_players = sorted([p for p in player_contributions if not p['is_captain'] and not p['is_on_bench']],
                            key=lambda x: x['points'], reverse=True)
    
    top_performers = []
    if active_players:
        if len(active_players) >= 1 and active_players[0]['points'] > 8:
            top_performers.append(f"{active_players[0]['name']} ({int(active_players[0]['points'])} mata)")
        if len(active_players) >= 2 and active_players[1]['points'] > 8:
            top_performers.append(f"{active_players[1]['name']} ({int(active_players[1]['points'])} mata)")

    if top_performers:
        analysis.append(f"Disokong oleh {', '.join(top_performers)}.")
    else:
        analysis.append("Pemain lain beraksi sederhana.")

    # General sentiment based on total points (can be refined with league average later)
    if gw_total_points >= 60: # Arbitrary threshold for a good week
        analysis.append("Minggu yang sangat baik secara keseluruhan!")
    elif gw_total_points >= 40:
        analysis.append("Pungutan mata yang solid minggu ini.")
    else:
        analysis.append("Perlu penambahbaikan minggu depan.")

    return " ".join(analysis)

def wrap_text_to_lines(text, width):
    """
    Wraps a given text into multiple lines for display in a table cell.
    """
    # Use textwrap to split the string into lines
    lines = textwrap.wrap(text, width=width)
    return "\n".join(lines)


def display_squad_table_in_plot(df_squad, gameweek_id):
    """
    Displays the squad DataFrame as a table within a Matplotlib plot.
    """
    analysis_wrap_width = 35 
    df_squad['Performance Analysis'] = df_squad['Performance Analysis'].apply(lambda x: wrap_text_to_lines(x, analysis_wrap_width))

    # Calculate row heights dynamically based on the number of lines in 'Squad' and 'Performance Analysis'
    # These factors are normalized to the total height of the table.
    # header_line_height_factor and data_line_height_factor are empirical for good spacing
    header_line_height_factor = 1.8 # Taller for header
    data_line_height_factor = 1.0   # Base height for a single line of data

    # Calculate the effective number of lines for each column in each row (including header)
    num_lines_per_cell = []
    
    # Header row
    header_lines = []
    for col_label in df_squad.columns:
        header_lines.append(col_label.count('\n') + 1)
    num_lines_per_cell.append(header_lines)

    # Data rows
    for index, row_data in df_squad.iterrows():
        row_line_counts = []
        for col_name in df_squad.columns:
            cell_content = str(row_data[col_name])
            row_line_counts.append(cell_content.count('\n') + 1)
        num_lines_per_cell.append(row_line_counts)
    
    # Now calculate max_lines_in_row for each row
    max_lines_in_each_row = [max(lines) for lines in num_lines_per_cell]
    
    # Calculate the total 'line units' for the entire table
    total_line_units = (max_lines_in_each_row[0] * header_line_height_factor) + \
                       sum([lines * data_line_height_factor for lines in max_lines_in_each_row[1:]])
    
    # Calculate relative heights (fractions of the total table height)
    relative_row_heights = []
    relative_row_heights.append((max_lines_in_each_row[0] * header_line_height_factor) / total_line_units)
    for i in range(1, len(max_lines_in_each_row)):
        relative_row_heights.append((max_lines_in_each_row[i] * data_line_height_factor) / total_line_units)

    # Calculate figure height based on the total line units and an empirical scaling factor
    # This ensures the figure is just tall enough for the content
    fig_height = total_line_units * 0.5 # Adjust 0.5 as an empirical scaling factor for visual height
    fig, ax = plt.subplots(figsize=(20, max(10, fig_height))) # Min height 10, otherwise dynamic
    ax.axis('off')
    ax.set_title(f'Squads for Gameweek {gameweek_id}', fontsize=16, pad=20)

    cell_text = df_squad.values.tolist()
    
    table = ax.table(cellText=cell_text,
                      colLabels=df_squad.columns,
                      loc='center',
                      cellLoc='left', # This sets default horizontal alignment
                      bbox=[0, 0, 1, 1])

    table.auto_set_font_size(False)
    table.set_fontsize(9)
    # Removed table.scale(1, 1.3)

    col_widths = [0.04, 0.12, 0.12, 0.07]
    remaining_width = 1 - sum(col_widths)
    squad_col_width = remaining_width * 0.45 
    analysis_col_width = remaining_width * 0.38 
    col_widths.extend([squad_col_width, analysis_col_width])

    # Set column widths and cell properties
    for i, width in enumerate(col_widths):
        if i < len(df_squad.columns):
            # Set header cell properties
            header_cell = table.get_celld()[(0, i)]
            header_cell.set_width(width) 
            header_cell.set_text_props(va='top') 
            header_cell.set_height(relative_row_heights[0]) # Set header row height

            # Set data cell properties for each row
            for row_idx in range(1, len(cell_text) + 1):
                cell = table.get_celld()[(row_idx, i)]
                cell.set_width(width)
                cell.set_text_props(va='top') 
                cell.set_height(relative_row_heights[row_idx]) # Set data row height dynamically

    plt.tight_layout()
    plt.show()

def save_table_to_csv(df, filename="fpl_squad_analysis.csv"):
    """
    Saves the given DataFrame to a CSV file.
    """
    try:
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"\nTable data saved successfully to '{filename}'")
    except Exception as e:
        print(f"\nError saving table data to CSV: {e}")


def generate_squad_table(league_id):
    """
    Generates and displays a graphical table of manager squads for the most recent gameweek,
    including performance analysis, and saves the data to a CSV.
    """
    global_player_map = get_global_player_data()
    if not global_player_map:
        print("Could not retrieve global player data. Exiting.")
        return

    managers_info = get_league_managers_info(league_id)
    if not managers_info:
        print("Could not retrieve mini-league manager info. Exiting.")
        return

    most_recent_gameweek = 0
    for manager in managers_info[:min(20, len(managers_info))]: 
        history = get_manager_history_for_gameweeks(manager['id'])
        if history:
            current_max_gw = max(history.keys())
            if current_max_gw > most_recent_gameweek:
                most_recent_gameweek = current_max_gw
        time.sleep(0.1) 

    if most_recent_gameweek == 0:
        print("No active gameweeks found for managers. Cannot generate squad table.")
        return
    
    gameweek_live_points_map = get_gameweek_live_data(most_recent_gameweek)
    if not gameweek_live_points_map:
        print(f"Could not retrieve live data for GW{most_recent_gameweek}. Player points might be incorrect or missing.")

        
    print(f"\n--- Fetching Squad & Points for Most Recent Gameweek (GW{most_recent_gameweek}) ---")
    
    table_rows = []
    headers = ["Rank", "Team", "Manager", "GW Total Points", "Squad", "Performance Analysis"] 
    
    for i, manager in enumerate(managers_info[:min(20, len(managers_info))]):
        rank = manager['rank_sort']
        team_name = manager['team_name']
        manager_name = manager['manager_name']
        
        squad_data_string, gw_total_points, player_contributions = get_manager_squad_for_gameweek(manager['id'], most_recent_gameweek, global_player_map, gameweek_live_points_map)
        
        analysis_string = analyze_gameweek_performance(gw_total_points, player_contributions)
        
        time.sleep(0.5) 
        
        table_rows.append([rank, team_name, manager_name, gw_total_points, squad_data_string, analysis_string])

    df_squad = pd.DataFrame(table_rows, columns=headers)
    
    display_squad_table_in_plot(df_squad, most_recent_gameweek)
    save_table_to_csv(df_squad, f"fpl_squad_analysis_gw{most_recent_gameweek}.csv")


# --- Main Execution ---
if __name__ == "__main__":
    generate_squad_table(LEAGUE_ID)
