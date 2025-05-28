export interface LocationCoords {
  lat: number;
  lon: number;
}

// pull location from OpenCageData 
export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry;
    const components = data.results[0].components;
    const name = components.city || components.town || components.village || components.county || components.state || components.country;
    return { lat, lon: lng, name };
  }
  return null;
}

// retrieves user location 
export async function getUserLocation(): Promise<{ location: LocationCoords; name: string } | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        const geoResult = await geocodeLocation(`${coords.lat},${coords.lon}`);
        if (geoResult) {
          resolve({ location: coords, name: geoResult.name });
        } else {
          resolve(null);
        }
      },
      () => resolve(null)
    );
  });
}

