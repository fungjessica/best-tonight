interface MoonPhaseResponse {
    imageUrl: string;
}

// pull moon phase data from AstronomyAPI
export async function fetchMoonPhaseImage(lat: number, lon: number, date: string): Promise<MoonPhaseResponse | null> {
    try {
      const appId = process.env.NEXT_PUBLIC_ASTRONOMY_API_ID!;
      const appSecret = process.env.NEXT_PUBLIC_ASTRONOMY_API_SECRET!;
      const credentials = btoa(`${appId}:${appSecret}`);
  
      const res = await fetch('https://api.astronomyapi.com/api/v2/studio/moon-phase', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style: { 
            moonStyle: "default",
            backgroundStyle: "stars", 
            backgroundColor: "red", 
            headingColor: "white", 
            textColor: "white"
          },
          format: "png",
          observer: {
            latitude: lat,
            longitude: lon,
            date: date,
          },
          view: { type: "landscape-simple" },
        }),
    });
    
    if (!res.ok) {
        const text = await res.text();
        console.error("Moon API error:", res.status, text);
        return null;
    }
  
    const data = await res.json();
      return { imageUrl: data.data.imageUrl };
    } catch (err) {
      console.error("Failed to fetch moon phase:", err);
      return null;
    }
}