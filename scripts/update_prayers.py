import os
import time
import requests
from datetime import datetime
from supabase import create_client, Client

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def main():
    try:
        # 1. Calculate current and next month (60-day rolling window)
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        # Safely handle December to January rollover
        next_month = current_month + 1 if current_month < 12 else 1
        next_year = current_year if current_month < 12 else current_year + 1
        
        months_to_fetch = [(current_month, current_year), (next_month, next_year)]
        
        active_iqama = {"fajr": "06:00", "dhuhr": "13:45", "asr": "18:30", "isha": "21:45"}
        formatted_data = []

        # Disguise the script as a web browser to bypass bot-blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        # 2. EXTRACT & TRANSFORM: Loop through both months with Fault Tolerance
        for m, y in months_to_fetch:
            print(f"Extracting data for {m}/{y}...")
            
            # Use exact coordinates to bypass broken text geocoding
            api_url = f"https://api.aladhan.com/v1/calendar/{y}/{m}?latitude=26.33&longitude=-80.217&method=1&school=1"
            
            max_retries = 3
            api_days = None
            
            for attempt in range(max_retries):
                try:
                    response = requests.get(api_url, headers=headers)
                    response.raise_for_status() 
                    api_days = response.json()["data"]
                    break  # Success! Break out of the retry loop
                except requests.exceptions.RequestException as e:
                    if attempt < max_retries - 1:
                        print(f"API Error ({e}). Retrying in 5 seconds... (Attempt {attempt + 2}/{max_retries})")
                        time.sleep(5)
                    else:
                        raise Exception(f"Failed to fetch data after {max_retries} attempts. Last error: {e}")

            for day in api_days:
                # Helper to strip out "(EST)" from the API strings
                def clean_time(time_str):
                    return time_str.split(" ")[0]
                
                # Convert DD-MM-YYYY to standard SQL YYYY-MM-DD
                raw_date = day["date"]["gregorian"]["date"]
                date_str = "-".join(raw_date.split("-")[::-1]) 
                
                formatted_data.append({
                    "date": date_str,
                    "fajr_adhan": clean_time(day["timings"]["Fajr"]),
                    "fajr_iqama": active_iqama["fajr"],
                    "dhuhr_adhan": clean_time(day["timings"]["Dhuhr"]),
                    "dhuhr_iqama": active_iqama["dhuhr"],
                    "asr_adhan": clean_time(day["timings"]["Asr"]),
                    "asr_iqama": active_iqama["asr"],
                    "maghrib_adhan": clean_time(day["timings"]["Maghrib"]),
                    "maghrib_iqama": clean_time(day["timings"]["Maghrib"]),
                    "isha_adhan": clean_time(day["timings"]["Isha"]),
                    "isha_iqama": active_iqama["isha"],
                })

        # 3. LOAD: Push all 60 days to Supabase (Overwrites existing dates automatically)
        print("Loading data into Supabase...")
        result = supabase.table("prayer_times").upsert(formatted_data).execute()
        
        print(f"Success! Loaded {len(formatted_data)} days of prayer times.")

    except Exception as e:
        print(f"ETL Pipeline Failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()