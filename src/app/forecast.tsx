export interface NwsForecastResult {
    forecast: string;
    icon: string;
    forecastDay: string;
    seeing: string;
    transparency: string;
}

// pull forecast data from NWS
export async function fetchNwsForecastData(location: { lat: number; lon: number }): Promise<NwsForecastResult | null> {
    try {
      const pointRes = await fetch(`https://api.weather.gov/points/${location.lat},${location.lon}`);
      const pointData = await pointRes.json();
      const forecastUrl = pointData.properties.forecast;
  
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
  
      const periods = forecastData.properties.periods;
      const now = new Date();
  
      // try to find the forecast for tonight
      let forecast = periods.find((p: any) => {
        const start = new Date(p.startTime);
        return start.getDate() === now.getDate() && start.getHours() >= 17;
    });
  
      // fallback to next valid evening forecast
    if (!forecast) {
        forecast = periods.find((p: any) => {
          const start = new Date(p.startTime);
          return start > now && start.getHours() >= 17;
        });
    }
  
    if (!forecast) return null;
  
      // estimate transparency
      const forecastText = forecast.detailedForecast.toLowerCase();
      let transparency = "Unknown";
      if (forecastText.includes('clear')) transparency = "Excellent";
      else if (forecastText.includes('partly')) transparency = "Fair";
      else if (forecastText.includes('cloudy')) transparency = "Poor";
  
      // estimate seeing
      let seeing = "Unknown";
      const windSpeed = forecast.windSpeed || "";
      const windValue = parseInt(windSpeed);
      if (!isNaN(windValue)) {
        if (windValue < 5) seeing = "Excellent";
        else if (windValue < 10) seeing = "Fair";
        else seeing = "Poor";
    }
  
    return {
        forecast: forecast.detailedForecast,
        icon: forecast.icon,
        forecastDay: forecast.name,
        seeing,
        transparency,
    };
    } catch (err) {
      console.error("Failed to fetch NWS forecast:", err);
      return null;
    }
  }