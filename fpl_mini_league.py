import requests
import pandas as pd
import matplotlib.pyplot as plt
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import time

# --- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MINI-LEAGUE ID ---
# How to find your LEAGUE_ID:
# 1. Log in to fantasy.premierleague.com
# 2. Go to 'Leagues & Cups' and click on your classic league.
# 3. Look at the URL in your browser: https://fantasy.premierleague.com/leagues/{LEAGUE_ID}/standings/classic
#    The number after '/leagues/' is your LEAGUE_ID.
LEAGUE_ID = 150789 # Example ID - You MUST change this to your league's ID!
# ---------------------------------------------------------------

# Configure retry strategy for network requests
# total: Maximum number of retries
# backoff_factor: Multiplier for exponential backoff (delay = backoff_factor * (2 ** (retry_count - 1)))
# status_forcelist: HTTP status codes to retry on (e.g., server errors, too many requests)
# allowed_methods: HTTP methods to retry (GET is idempotent, safe to retry)
retry_strategy = Retry(
    total=5,  # Total retries
    backoff_factor=1,  # 1, 2, 4, 8, 16 seconds delay
    status_forcelist=[429, 500, 502, 503, 504], # Too Many Requests, Server Errors
    allowed_methods=["HEAD", "GET", "OPTIONS"] # Only retry GET requests as they are safe
)

# Create an HTTP session and mount the retry adapter
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)
http.mount("http://", adapter)


def get_league_data(league_id):
    """
    Fetches the league standings and returns a dictionary mapping manager IDs to team names.
    This is used to get all the manager_ids within your specified league.
    """
    url = f"https://fantasy.premierleague.com/api/leagues-classic/{league_id}/standings/"
    try:
        # Added a timeout for the request (connect timeout, read timeout)
        # Added verify=False to bypass SSL certificate verification
        response = http.get(url, timeout=(5, 10), verify=False) 
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        
        managers = {}
        # The 'results' array contains data for each team/manager in the league
        for player_entry in data['standings']['results']:
            managers[player_entry['entry']] = player_entry['entry_name']
        
        return managers
        
    except requests.exceptions.Timeout as e:
        print(f"Request timed out for league ID {league_id}: {e}")
        return {}
    except requests.exceptions.RequestException as e:
        print(f"Error fetching league data for ID {league_id}: {e}")
        return {}

def get_manager_points_history(manager_id):
    """
    Fetches the gameweek history for a single manager.
    Returns a dictionary where keys are gameweek numbers and values are cumulative points.
    """
    url = f"https://fantasy.premierleague.com/api/entry/{manager_id}/history/"
    try:
        # Added a timeout for the request
        # Added verify=False to bypass SSL certificate verification
        response = http.get(url, timeout=(5, 10), verify=False) 
        response.raise_for_status()
        data = response.json()
        
        history = {
            item['event']: item['total_points'] # 'event' is the gameweek number, 'total_points' is cumulative
            for item in data['current']
        }
        
        return history
    
    except requests.exceptions.Timeout as e:
        print(f"Request timed out for manager ID {manager_id}: {e}")
        return {}
    except requests.exceptions.RequestException as e:
        print(f"Error fetching manager history for ID {manager_id}: {e}")
        return {}

def plot_gameweek_standings(league_id):
    """
    Main function to fetch all necessary data and plot the gameweek standings.
    It fetches league members, then their individual gameweek history, and finally plots it.
    """
    print(f"Fetching manager IDs for league: {league_id}...")
    managers = get_league_data(league_id)
    
    if not managers:
        print("No managers found or error retrieving league data. Please check your LEAGUE_ID and internet connection.")
        return

    # Dictionary to store all managers' points history, indexed by gameweek
    all_managers_gw_points = {}
    
    print("Fetching historical points data for managers (this may take a moment)...")
    
    # It's good practice to limit the number of managers for plotting clarity too
    # This also helps manage API call volume.
    managers_to_plot = list(managers.items())[:10] 

    for manager_id, team_name in managers_to_plot:
        print(f"  Fetching history for {team_name} (ID: {manager_id})...")
        points_history = get_manager_points_history(manager_id)
        if points_history:
            # Store points for this manager, using gameweek as index
            all_managers_gw_points[team_name] = points_history
        else:
            print(f"  Could not retrieve history for {team_name}. Skipping.")
        
        # Add a small delay between requests to avoid hitting rate limits
        time.sleep(0.5) 

    if not all_managers_gw_points:
        print("No historical points data could be retrieved for any managers to plot.")
        return
        
    # Convert the dictionary of histories into a Pandas DataFrame
    # This aligns all managers' points by gameweek (index)
    df_standings = pd.DataFrame(all_managers_gw_points)
    
    # Fill any potential missing gameweeks (e.g., if a manager joined late) with the previous score
    # This creates a continuous line on the plot.
    df_standings = df_standings.ffill() 
    df_standings = df_standings.fillna(0) # Fill any initial NaNs (before first gameweek) with 0

    # Plotting
    plt.style.use('seaborn-v0_8-darkgrid') # A clean and appealing plotting style
    plt.figure(figsize=(14, 8)) # Adjust figure size for better readability
    
    for column in df_standings.columns:
        plt.plot(df_standings.index, df_standings[column], label=column, 
                 marker='o', markersize=5, linewidth=2) # Add markers and adjust line style
    
    plt.title(f'Mini-League Standings: {LEAGUE_ID} - Cumulative Points by Gameweek', fontsize=18, pad=20)
    plt.xlabel('Gameweek', fontsize=14, labelpad=15)
    plt.ylabel('Cumulative Points', fontsize=14, labelpad=15)
    
    # Set x-axis ticks to show every gameweek explicitly if there aren't too many
    if len(df_standings.index) <= 40: # Assuming max 38 gameweeks
        plt.xticks(df_standings.index)
    
    plt.legend(title='Team Name', bbox_to_anchor=(1.02, 1), loc='upper left', borderaxespad=0.)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout(rect=[0, 0, 0.85, 1]) # Adjust layout to make room for the legend
    plt.show()

# Run the plotting function
plot_gameweek_standings(LEAGUE_ID)
