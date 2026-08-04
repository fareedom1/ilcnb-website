import os
import requests
from datetime import datetime
from supabase import create_client, Client

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def main():
    try:
        # 1. EXTRACT: Get the current month and year, fetch from Aladhan API
        now = datetime.now()
        month = now.month
        year = now.year
        
        print(f"Extracting data for {month}/{year}...")
        api_url = f"https://api.aladhan.com/v1/calendarByCity/{year}/{month}?city=Coconut%20Creek&country=United%20States&state=Florida&method=1&school=1"
        response = requests.get(api_url)
        response.raise_for_status()
        api_days = response.json()["data"]

        # 2. TRANSFORM: Clean data and add custom Iqama logic
        print("Transforming data...")
        active_iqama = {"fajr": "06:00", "dhuhr": "13:45", "asr": "18:30", "isha": "21:45"}
        formatted_data = []

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

        # 3. LOAD: Push to Supabase
        print("Loading data into Supabase...")
        result = supabase.table("prayer_times").upsert(formatted_data).execute()
        
        print(f"Success! Loaded {len(formatted_data)} days of prayer times.")

    except Exception as e:
        print(f"ETL Pipeline Failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()