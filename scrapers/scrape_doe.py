# scrapers/scrape_doe.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time
import utils # Import our shared tool

def run():
    print("--- Starting DOE Scraper ---")
    driver = utils.get_driver()
    results = []

    try:
        url = "https://www.energy.gov/internships-fellowships"
        driver.get(url)
        time.sleep(5) # Let JS load

        # 1. Expand the table
        try:
            select = Select(driver.find_element(By.NAME, "DataTables_Table_0_length"))
            select.select_by_value('100')
            time.sleep(2)
        except Exception as e:
            print(f"DOE: Could not expand table (might be static): {e}")

        # 2. Scrape Rows
        rows = driver.find_elements(By.CSS_SELECTOR, "#DataTables_Table_0 tbody tr")
        print(f"DOE: Found {len(rows)} rows.")

        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 6:
                # Extract Link safely
                try:
                    link_el = cells[5].find_element(By.TAG_NAME, "a")
                    link_url = link_el.get_attribute("href")
                except:
                    link_url = "https://www.energy.gov/internships-fellowships"

                # Normalize to generic keys for the Master View
                results.append({
                    "Program": cells[0].text,
                    "Compensation": cells[1].text,
                    "Topic": cells[2].text,         # "Academic Disciplines"
                    "Location": cells[3].text,      # "Housing" (Close enough mapping)
                    "Dates": cells[4].text,         # "Availability"
                    "Link": link_url
                })
    except Exception as e:
        print(f"DOE Error: {e}")
    finally:
        driver.quit()
    
    print(f"DOE: Finished with {len(results)} items.")
    return results
