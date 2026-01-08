# scrapers/main.py
import json
import os
import sys

# Ensure we can import modules from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# --- IMPORT YOUR INDIVIDUAL SCRAPERS HERE ---
import scrape_doe
# import scrape_nsf (Example for later)
# import scrape_levels (Example for later)

# 1. Define the Master View Layout (Your PWA Design)
# We use generic headers like "Topic" and "Dates" so all websites fit into this one view.
master_view = {
    "name": "Live Internship Feed",
    "createdAt": 10101010, 
    "canvasBg": "#f1f5f9",
    "headers": ["Program", "Compensation", "Topic", "Location", "Dates", "Link"],
    "boxes": [
        # Top Left: Program Name
        {"x": 0, "y": 0, "w": 4, "h": 1, "title": "Program / Role", "textVal": "Program", "isVar": True, "bgColor": "#0f172a", "textColor": "#ffffff", "fontSize": 22},
        # Top Right: Compensation
        {"x": 4, "y": 0, "w": 2, "h": 1, "title": "Pay / Funding", "textVal": "Compensation", "isVar": True, "bgColor": "#10b981", "textColor": "#ffffff", "fontSize": 18},
        # Mid Left: Dates
        {"x": 0, "y": 1, "w": 3, "h": 1, "title": "Timeline / Deadline", "textVal": "Dates", "isVar": True, "bgColor": "#ffffff", "textColor": "#000000", "fontSize": 16},
        # Mid Right: Location/Housing
        {"x": 3, "y": 1, "w": 3, "h": 1, "title": "Location / Housing", "textVal": "Location", "isVar": True, "bgColor": "#ffffff", "textColor": "#000000", "fontSize": 16},
        # Bottom: Topics/Disciplines
        {"x": 0, "y": 2, "w": 6, "h": 1, "title": "Tags & Disciplines", "textVal": "Topic", "isVar": True, "bgColor": "#cbd5e1", "textColor": "#1e293b", "fontSize": 14},
        # Footer: The Link
        {"x": 0, "y": 3, "w": 6, "h": 1, "title": "Application Link", "textVal": "Link", "isVar": True, "bgColor": "#3b82f6", "textColor": "#ffffff", "fontSize": 20}
    ],
    "data": [],
    "history": []
}

# 2. Run Scrapers Sequentially
all_data = []

# --- RUN DOE ---
try:
    doe_data = scrape_doe.run()
    all_data.extend(doe_data)
except Exception as e:
    print(f"CRITICAL ERROR running DOE scraper: {e}")

# --- RUN NEXT SCRAPER (Example) ---
# try:
#     nsf_data = scrape_nsf.run()
#     all_data.extend(nsf_data)
# except: ...


# 3. Save to JSON
master_view["data"] = all_data

# Define output path: ../data/internships.json
output_dir = os.path.join(os.path.dirname(__file__), '../data')
os.makedirs(output_dir, exist_ok=True) # Create folder if it doesn't exist

output_path = os.path.join(output_dir, 'internships.json')

with open(output_path, 'w') as f:
    json.dump([master_view], f, indent=2)

print(f"SUCCESS: Master JSON saved to {output_path} with {len(all_data)} total rows.")
