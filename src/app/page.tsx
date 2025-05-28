'use client';
import Link from 'next/link';
import { useState, useEffect, ChangeEvent } from 'react';
import './page.css'; 

// file imports 
import { fetchNwsForecastData } from './forecast';
import { geocodeLocation, getUserLocation } from './location';
import { fetchMoonPhaseImage } from './moon-phase';

// font awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

interface Location {
  lat: number;
  lon: number;
}

interface SkyObject {
  name: string;
  type: string;
  time: string;
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moonPhase, setMoonPhase] = useState<string>('');
  const [moonImage, setMoonImage] = useState<string>("https://static.wikia.nocookie.net/fnaf-the/images/4/40/Freddy_fazbear_full_body_.png");
  const [visibleObjects, setVisibleObjects] = useState<SkyObject[]>([]);
  const [time, setTime] = useState<Date>(new Date());
  const [suggestions, setSuggestions] = useState<{label: string, coords: {lat: number, lng: number}, name: string}[]>([]);
  const [locationSearchValue, setLocationSearchValue] = useState<string>("");
  const [locationName, setLocationName] = useState<string>('');
  const [nwsForecast, setNwsForecast] = useState<string | null>(null);
  const [nwsForecastIcon, setNwsForecastIcon] = useState<string | null>(null);
  const [estimatedSeeing, setEstimatedSeeing] = useState<string>('');
  const [estimatedTransparency, setEstimatedTransparency] = useState<string>('');
  const [forecastDay, setForecastDay] = useState<string | null>(null);

  // get user location
  useEffect(() => {
    getUserLocation().then((result) => {
      if (result) {
        setLocation(result.location);
        setLocationName(result.name);
      } else {
        setError('Permission denied or unavailable');
      }
    });
  }, []);

  // get moon phase for user location
  useEffect(() => {
    if (!location) return;

    (async () => {
      console.log("App ID:", process.env.NEXT_PUBLIC_ASTRONOMY_API_ID);
      
      const { lat, lon } = location;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localFormattedDate = `${year}-${month}-${day}`;

      const moonData = await fetchMoonPhaseImage(lat, lon, localFormattedDate);
      if (moonData) {
        setMoonImage(moonData.imageUrl);
      } else {
        setMoonPhase('Unknown');
        setMoonImage('');
      }

      // get forecast for user location
      const result = await fetchNwsForecastData(location);
      if (result) {
        setNwsForecast(result.forecast);
        setNwsForecastIcon(result.icon);
        setForecastDay(result.forecastDay);
        setEstimatedSeeing(result.seeing);
        setEstimatedTransparency(result.transparency);
      } else {
        setNwsForecast("Unable to load forecast.");
        setNwsForecastIcon(null);
        setEstimatedSeeing("Unknown");
        setEstimatedTransparency("Unknown");
        setForecastDay(null);
      }
    })();
  }, [location, time]);

  // get and set user time
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHour = parseInt(e.target.value);
    const newTime = new Date();
    newTime.setHours(newHour);
    setTime(newTime);
  };

  // react components
  return (
    <div className="main-page">
      <div className="main-page-header">
        <Link href="/journal" className="nav-link">My Sky-Journal</Link>
        <h1 className="main-header">What's In My Sky-Yard Tonight?</h1>
      
        <div className="main-header-location-bar">
          <input
            id="locationSearch"
            type="text"
            value={locationSearchValue}
            placeholder="Search Location"
            onChange={async (e) => {
              setLocationSearchValue(e.target.value);
              const value = e.target.value.trim();
              if (value.length < 3) {
                setSuggestions([]);
                return;
              }
              const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY!;
              const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&key=${apiKey}&limit=5`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                const newSuggestions = data.results.map((r: any) => ({
                  label: r.formatted,
                  coords: r.geometry,
                  name: r.components.city || r.components.town || r.components.village || r.components.county || r.components.state || r.components.country
                }));
                setSuggestions(newSuggestions);
              } else {
                setSuggestions([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value.includes(',')) {
                  const [lat, lon] = value.split(',').map(Number);
                  if (!isNaN(lat) && !isNaN(lon)) {
                    setLocation({ lat, lon });
                    setSuggestions([]);
                  }
                } else {
                  geocodeLocation(value).then((result) => {
                    if (result) {
                      setLocation({ lat: result.lat, lon: result.lon });
                      setLocationName(result.name);
                      setSuggestions([]);
                    } else {
                      alert("Could not find location. Try coordinates like '37.77,-122.42'");
                    }
                  });
                }
              }
            }}
            className="location-header-search"
          />
          {suggestions.length > 0 && (
            <div className="suggested-locations-div">
              {suggestions.map((place, idx) => (
                <div
                  key={idx}
                  className="clickable-locs"
                  onClick={() => {
                    const coords = place.coords;
                    setLocation({ lat: coords.lat, lon: coords.lng });
                    setLocationSearchValue(place.label);
                    setLocationName(place.name);
                    setSuggestions([]);
                  }}
                >
                  {place.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="main-header-location">
          <FontAwesomeIcon icon={faLocationDot} className='font-awesome-icons'/>
          {locationName || "Detecting location..."} {location && `(${location.lat.toFixed(2)}, ${location.lon.toFixed(2)})`}
        </div>
      </div>
      <p className='main-header'></p>
      {error && <p className="error-text">{error}</p>}
      {location ? (
        <>
          <div className="moon-time-container">
            {moonImage && <img src={moonImage} alt="Moon phase" className="moon-image" />}
            <div className="time-slider-box">
              <label htmlFor="timeSlider" className="time-slider-label">🕐 Time of Night:</label>
              <input
                id="timeSlider"
                type="range"
                min="0"
                max="23"
                step="1"
                value={time.getHours()}
                onChange={handleTimeChange}
                className="time-slider"
              />
              <p className="selected-time">Selected Time: {time.getHours()}:00</p>
            </div>
          </div>

          <div className="info-sections">
            {nwsForecast && (
              <div className="weather-forecast">
                <h2 className="forecast-header">
                  <FontAwesomeIcon icon={faCloud} className='font-awesome-icons'/>NWS Forecast {forecastDay ? `for ${forecastDay}` : ''}</h2>
                {nwsForecastIcon && (
                  <img src={nwsForecastIcon} alt="Forecast icon" className="forecast-icon" />
                )}
                <p>{nwsForecast}</p>
                <p><strong>Estimated Seeing:</strong> {estimatedSeeing}</p>
                <p><strong>Estimated Transparency:</strong> {estimatedTransparency}</p>
                <p className='nws-disclaimer'><FontAwesomeIcon icon={faCircleExclamation} className='font-awesome-icons'/>Based on NOAA forecast estimates. They may differ from actual sky conditions.</p>
              </div>
            )}

            <div className="vis-obj-div">
              <h2 className="vis-obj-header">🔭 Visible Objects</h2>
              <ul className="second-vis-obj-div">
                {visibleObjects.map((obj, index) => (
                  <li key={index} className="vis-obj-list">
                    <strong>{obj.name}</strong> – {obj.type} (Visible: {obj.time})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}