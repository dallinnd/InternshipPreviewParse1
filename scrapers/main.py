import json
import os
# Import your individual scrapers as modules
import scrape_doe
import scrape_nsf
# import scrape_levels 

# Initialize the Master View Structure
master_view = {
    "name": "All Internships 2026",
    "createdAt": 100000, 
    "canvasBg": "#f8fafc",
    "headers": ["Program", "Role", "Location", "Deadline", "Link"],
    "boxes": [ /* ... your standard layout ... */ ],
    "data": []
}

# --- RUN SCRAPER 1: DOE ---
try:
    print("Running DOE Scraper...")
    doe_data = scrape_doe.run() # Assume your script has a run() function returning a list
    master_view["data"].extend(doe_data)
except Exception as e:
    print(f"DOE Scraper failed: {e}")

# --- RUN SCRAPER 2: NSF ---
try:
    print("Running NSF Scraper...")
    nsf_data = scrape_nsf.run()
    master_view["data"].extend(nsf_data)
except Exception as e:
    print(f"NSF Scraper failed: {e}")

# --- SAVE EVERYTHING ---
# Save to the 'data' folder in the root
output_path = os.path.join(os.path.dirname(__file__), '../data/internships.json')
with open(output_path, 'w') as f:
    json.dump([master_view], f, indent=2)

print(f"Done! Saved {len(master_view['data'])} total internships.")
