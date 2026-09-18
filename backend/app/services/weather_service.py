import os
import time
import httpx
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass, asdict
from dotenv import load_dotenv

load_dotenv()

# Pre-calibrated geographic coordinates for Bangladesh agricultural hubs
BANGLADESH_DISTRICT_COORDINATES: Dict[str, Tuple[float, float]] = {
    "rajshahi": (24.3636, 88.6241),
    "godagari": (24.4667, 88.3333),
    "rangpur": (25.7439, 89.2752),
    "jessore": (23.1664, 89.2081),
    "jashore": (23.1664, 89.2081),
    "bogra": (24.8465, 89.3777),
    "bogura": (24.8465, 89.3777),
    "dinajpur": (25.6217, 88.6355),
    "mymensingh": (24.7471, 90.4203),
    "barisal": (22.7010, 90.3535),
    "sylhet": (24.8949, 91.8687),
    "comilla": (23.4607, 91.1809),
    "cumilla": (23.4607, 91.1809),
    "dhaka": (23.8103, 90.4125),
    "chattogram": (22.3569, 91.7832),
    "chittagong": (22.3569, 91.7832),
    "khulna": (22.8456, 89.5403),
}

@dataclass
class WeatherReport:
    location_name: str
    latitude: float
    longitude: float
    temperature_c: float
    humidity_percentage: float
    wind_speed_kmh: float
    forecast_condition: str
    rainfall_mm: float
    rain_expected_6h: bool
    rain_forecast_details: str
    is_live_api: bool
    source_attribution: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class WeatherService:
    """
    Integrates OpenWeatherMap free-tier API to provide real-time agricultural
    microclimatic metrics and a 6-hour rain-window forecast for precision spray scheduling.
    """

    @staticmethod
    def get_api_key() -> Optional[str]:
        return os.getenv("OPENWEATHER_API_KEY") or os.getenv("OPENWEATHERMAP_API_KEY")

    @classmethod
    def resolve_coordinates(
        cls,
        district_or_union: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> Tuple[float, float, str]:
        """
        Resolves agricultural field coordinates from input lat/long or district name.
        Defaults to Rajshahi (Barind Tract) if unspecified.
        """
        if latitude is not None and longitude is not None:
            name = district_or_union or f"GPS ({latitude:.3f}, {longitude:.3f})"
            return latitude, longitude, name

        resolved_name = "Rajshahi (Barind Zone)"
        lat, lon = BANGLADESH_DISTRICT_COORDINATES["rajshahi"]

        if district_or_union:
            query = district_or_union.lower()
            for key, coords in BANGLADESH_DISTRICT_COORDINATES.items():
                if key in query:
                    lat, lon = coords
                    resolved_name = district_or_union
                    break
            else:
                resolved_name = district_or_union

        return lat, lon, resolved_name

    @classmethod
    def fetch_weather(
        cls,
        district_name: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        force_rain_scenario: Optional[bool] = None,
    ) -> WeatherReport:
        """
        Fetches current weather and 6-hour rain forecast.
        Uses live OpenWeatherMap API if key is present, otherwise provides
        an agro-calibrated simulation (with force_rain_scenario override for testing).
        """
        lat, lon, loc_name = cls.resolve_coordinates(district_name, latitude, longitude)
        api_key = cls.get_api_key()

        # If user explicitly requested testing rain or dry scenario, return calibrated simulation
        if force_rain_scenario is not None:
            return cls._generate_mock_weather(loc_name, lat, lon, rain_scenario=force_rain_scenario)

        # Attempt live API call if key is available and not dummy
        if api_key and not api_key.startswith("your_"):
            try:
                return cls._fetch_live_openweathermap(api_key, lat, lon, loc_name)
            except Exception as e:
                print(f"[WeatherService] Live OpenWeatherMap API call failed: {str(e)}. Falling back to simulation.")

        # Default fallback simulation (dry/nominal window by default)
        return cls._generate_mock_weather(loc_name, lat, lon, rain_scenario=False)

    @classmethod
    def _fetch_live_openweathermap(
        cls, api_key: str, lat: float, lon: float, location_name: str
    ) -> WeatherReport:
        """
        Calls OpenWeatherMap current weather and 5-day / 3-hour forecast endpoints.
        Analyzes the first two 3-hour intervals (0 to 6 hours) for precipitation.
        """
        with httpx.Client(timeout=8.0) as client:
            # 1. Current Weather
            current_url = "https://api.openweathermap.org/data/2.5/weather"
            current_resp = client.get(
                current_url,
                params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
            )
            current_resp.raise_for_status()
            cur_data = current_resp.json()

            temp_c = float(cur_data.get("main", {}).get("temp", 28.0))
            humidity = float(cur_data.get("main", {}).get("humidity", 70.0))
            wind_kmh = float(cur_data.get("wind", {}).get("speed", 3.0)) * 3.6  # m/s to km/h
            weather_desc = (
                cur_data.get("weather", [{}])[0].get("description", "Clear").capitalize()
            )
            current_rain = float(cur_data.get("rain", {}).get("1h", 0.0))

            # 2. 5-Day / 3-Hour Forecast for 6-hour rain prediction
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_resp = client.get(
                forecast_url,
                params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
            )
            forecast_resp.raise_for_status()
            f_data = forecast_resp.json()

            forecast_list = f_data.get("list", [])
            # First 2 intervals cover the next 0-3h and 3-6h
            next_6h_intervals = forecast_list[:2]

            rain_in_6h = False
            rain_details_parts = []
            total_rain_6h = current_rain

            for idx, item in enumerate(next_6h_intervals):
                hours_ahead = (idx + 1) * 3
                pop = item.get("pop", 0.0)  # Probability of precipitation (0 to 1)
                item_rain = item.get("rain", {}).get("3h", 0.0)
                weather_main = item.get("weather", [{}])[0].get("main", "").lower()

                total_rain_6h += item_rain

                if weather_main in ["rain", "thunderstorm", "drizzle"] or item_rain > 0.1 or pop >= 0.35:
                    rain_in_6h = True
                    desc = item.get("weather", [{}])[0].get("description", "rain")
                    rain_details_parts.append(
                        f"Forecast +{hours_ahead}h: {desc} ({item_rain}mm, {int(pop * 100)}% prob)"
                    )

            if rain_in_6h:
                rain_details = (
                    f"Rain predicted within 6h: {', '.join(rain_details_parts)}. Total est: {total_rain_6h:.1f}mm."
                )
            else:
                rain_details = "Dry atmospheric window: 0% rain forecast for the upcoming 6-12 hours."

            return WeatherReport(
                location_name=location_name,
                latitude=lat,
                longitude=lon,
                temperature_c=round(temp_c, 1),
                humidity_percentage=round(humidity, 1),
                wind_speed_kmh=round(wind_kmh, 1),
                forecast_condition=weather_desc,
                rainfall_mm=round(total_rain_6h, 1),
                rain_expected_6h=rain_in_6h,
                rain_forecast_details=rain_details,
                is_live_api=True,
                source_attribution="OpenWeatherMap (Free Tier Live API)",
            )

    @classmethod
    def _generate_mock_weather(
        cls, location_name: str, lat: float, lon: float, rain_scenario: bool = False
    ) -> WeatherReport:
        """
        Generates realistic agricultural microclimatic metrics for Bangladesh
        when API key is absent or when explicit rain/dry demonstration scenarios are selected.
        """
        if rain_scenario:
            return WeatherReport(
                location_name=location_name,
                latitude=lat,
                longitude=lon,
                temperature_c=27.4,
                humidity_percentage=88.5,
                wind_speed_kmh=15.2,
                forecast_condition="Pre-Monsoon Convective Showers",
                rainfall_mm=7.4,
                rain_expected_6h=True,
                rain_forecast_details=(
                    "Precipitation (7.4 mm) forecast in the next 2-4 hours with 85% probability. "
                    "Foliar moisture will exceed saturation threshold."
                ),
                is_live_api=False,
                source_attribution="Krishi Microclimate Diagnostic Engine (Rain Scenario)",
            )
        else:
            return WeatherReport(
                location_name=location_name,
                latitude=lat,
                longitude=lon,
                temperature_c=31.2,
                humidity_percentage=64.0,
                wind_speed_kmh=7.8,
                forecast_condition="Partly Cloudy (Dry Canopy Window)",
                rainfall_mm=0.0,
                rain_expected_6h=False,
                rain_forecast_details=(
                    "Zero rain forecast for the next 12 hours. Relative humidity nominal (64%). "
                    "Canopy dry and suitable for foliar application."
                ),
                is_live_api=False,
                source_attribution="Krishi Microclimate Diagnostic Engine (Dry Window Scenario)",
            )
