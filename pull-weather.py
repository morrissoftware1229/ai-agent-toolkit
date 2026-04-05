import json
import os
import re
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from dotenv import load_dotenv

load_dotenv()

GRID_X = os.getenv("WEATHER_GOV_GRID_X")
GRID_Y = os.getenv("WEATHER_GOV_GRID_Y")
GRIDPOINT_URL = f"https://api.weather.gov/gridpoints/MEG/{GRID_X},{GRID_Y}"
OUTPUT_PATH = "./formatted_docs/weather-skycover.json"
USER_AGENT = "ai-agent-toolkit/0.1 (local use)"


def fetch_gridpoint_data():
    request = Request(
        GRIDPOINT_URL,
        headers={
            "Accept": "application/geo+json",
            "User-Agent": USER_AGENT,
        },
    )

    with urlopen(request) as response:
        return json.load(response)


def normalize_skycover(payload):
    properties = payload.get("properties", {})
    skycover = properties.get("skyCover") or properties.get("skycover")

    if not skycover:
        raise ValueError("Could not find skyCover in the gridpoint response.")

    unit = skycover.get("uom")
    values = skycover.get("values", [])

    normalized = []

    for item in values:
        valid_time = item["validTime"]
        start_time, end_time = parse_valid_time(valid_time)
        normalized.append(
            {
                "start_time": start_time,
                "end_time": end_time,
                "valid_time": valid_time,
                "skycover": item["value"],
                "unit": unit,
            }
        )

    return normalized


def parse_valid_time(valid_time):
    start_raw, duration_raw = valid_time.split("/", maxsplit=1)
    start_dt = datetime.fromisoformat(start_raw)
    end_dt = start_dt + parse_iso_duration(duration_raw)

    return start_dt.isoformat(), end_dt.isoformat()


def parse_iso_duration(duration):
    match = re.fullmatch(
        r"P(?:(?P<days>\d+)D)?(?:T(?:(?P<hours>\d+)H)?(?:(?P<minutes>\d+)M)?(?:(?P<seconds>\d+)S)?)?",
        duration,
    )

    if not match:
        raise ValueError(f"Unsupported ISO-8601 duration: {duration}")

    parts = {
        name: int(value) if value else 0
        for name, value in match.groupdict().items()
    }

    return timedelta(
        days=parts["days"],
        hours=parts["hours"],
        minutes=parts["minutes"],
        seconds=parts["seconds"],
    )


def write_output(records):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    payload = {
        "source": GRIDPOINT_URL,
        "record_count": len(records),
        "skycover": records,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)


def main():
    if not GRID_X or not GRID_Y:
        raise ValueError("WEATHER_GOV_GRID_X and WEATHER_GOV_GRID_Y must be set.")

    payload = fetch_gridpoint_data()
    records = normalize_skycover(payload)
    write_output(records)
    print(f"Wrote {len(records)} skycover records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
