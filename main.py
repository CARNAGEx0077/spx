from flask import Flask, jsonify
import requests
from flask_cors import CORS
import time
import os
from dotenv import load_dotenv





app = Flask(__name__)
CORS(app)

# ============================================
# 🔑 CONFIG (REPLACE THESE)
# ============================================
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
SHEET_ID = os.getenv("SHEET_ID")


# Sheet ranges (MATCH YOUR TAB NAMES EXACTLY)
SIDE_RANGE = "sidedata!A:D"
LIVE_RANGE = "LiveData!A:E"

BASE_URL = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values"


# ============================================
# 🔥 CACHE SYSTEM (SIDE DATA)
# ============================================

side_cache = []
side_last_fetch = 0
CACHE_DURATION = 1  # seconds


# ============================================
# 🔹 GENERIC FETCH FUNCTION
# ============================================

def fetch_sheet(range_name):
    url = f"{BASE_URL}/{range_name}?key={API_KEY}"

    try:
        response = requests.get(url)
        data = response.json()
        return data.get("values", [])
    except:
        return []


# ============================================
# 🔹 SIDE DATA (FAST + CACHED)
# ============================================

def get_side_data():
    global side_cache, side_last_fetch

    now = time.time()

    # 🔥 RETURN CACHE IF RECENT
    if now - side_last_fetch < CACHE_DURATION:
        return side_cache

    rows = fetch_sheet(SIDE_RANGE)

    if not rows:
        return side_cache  # fallback if API fails

    headers = rows[0]
    data_rows = rows[1:]

    clean_data = []

    for row in data_rows:
        try:
            team = {
                headers[i]: row[i] if i < len(row) else ""
                for i in range(len(headers))
            }

            clean_team = {
                "TEAM": team.get("TEAM_NAME", "").strip(),
                "PTS": int(team.get("TOTAL_POINTS", 0)),
                "ALIVE": int(team.get("ALIVE", 0)),
                "ELIMS": int(team.get("KILL_POINTS", 0)),
            }

            if clean_team["TEAM"]:
                clean_data.append(clean_team)

        except:
            continue

    # 🔥 UPDATE CACHE
    side_cache = clean_data
    side_last_fetch = now

    return clean_data


# ============================================
# 🔹 LIVE DATA (MAIN SCOREBOARD)
# ============================================

def get_live_data():
    rows = fetch_sheet(LIVE_RANGE)

    if not rows:
        return []

    headers = rows[0]
    data_rows = rows[1:]

    clean_data = []

    for row in data_rows:
        try:
            team = {
                headers[i]: row[i] if i < len(row) else ""
                for i in range(len(headers))
            }

            clean_team = {
                "TEAM": team.get("TEAM", "").strip(),
                "BOOYAH": int(team.get("BOOYAH", 0)),
                "PLACEMENT_POINTS": int(team.get("PLACEMENT_POINTS", 0)),
                "KILL_POINTS": int(team.get("KILL_POINTS", 0)),
                "TOTAL_POINTS": int(team.get("TOTAL_POINTS", 0)),
            }

            if clean_team["TEAM"]:
                clean_data.append(clean_team)

        except:
            continue

    return clean_data


# ============================================
# 🔹 ROUTES
# ============================================

# 👉 SIDE (RAW, UNSORTED)
@app.route("/side")
def side():
    return jsonify(get_side_data())


# 👉 OVERALL (SORTED + RANK)
@app.route("/overall")
def overall():
    data = get_live_data()

    sorted_data = sorted(
        data,
        key=lambda x: (
            x["TOTAL_POINTS"],
            x["KILL_POINTS"],
            x["PLACEMENT_POINTS"]
        ),
        reverse=True
    )

    for i, team in enumerate(sorted_data, start=1):
        team["RANK"] = i

    return jsonify(sorted_data)


# 👉 HEALTH CHECK
@app.route("/")
def home():
    return "Google Sheets API Backend Running 🚀"


# ============================================
# 🔹 RUN SERVER
# ============================================

if __name__ == "__main__":
    app.run(debug=True)