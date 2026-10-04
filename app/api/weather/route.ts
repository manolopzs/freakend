import { NextResponse } from 'next/server';
import { WeatherDay, WeatherForecast, WeatherCondition } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Open-Meteo is free and requires no API key. 7-day daily forecast for Madrid.
const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/Madrid&forecast_days=7';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// WMO weather interpretation codes → app condition.
// https://open-meteo.com/en/docs (weathercode)
function mapWeatherCode(code: number): { condition: string; icon: string; weather: WeatherCondition } {
  if (code >= 95) return { condition: 'Thunderstorm', icon: '⛈️', weather: 'storm' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { condition: 'Snow', icon: '❄️', weather: 'snow' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { condition: 'Rain', icon: '🌧️', weather: 'rain' };
  if (code === 45 || code === 48) return { condition: 'Fog', icon: '🌫️', weather: 'sunny' };
  if (code === 3) return { condition: 'Overcast', icon: '☁️', weather: 'sunny' };
  if (code === 2) return { condition: 'Partly cloudy', icon: '⛅', weather: 'sunny' };
  return { condition: 'Sunny', icon: '☀️', weather: 'sunny' };
}

function mockForecast(): WeatherForecast {
  return {
    location: 'Madrid',
    days: [
      { date: todayStr(), tempMax: 22, tempMin: 12, precipitation: 0, condition: 'Sunny', icon: '☀️', weather: 'sunny' },
    ],
  };
}

export async function GET() {
  try {
    const res = await fetch(OPEN_METEO_URL, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(mockForecast());
    }
    const data = await res.json();
    const daily = data.daily;
    const dates: string[] = daily?.time ?? [];
    if (dates.length === 0 || !Array.isArray(daily?.temperature_2m_max)) {
      return NextResponse.json(mockForecast());
    }

    const days: WeatherDay[] = dates.map((date, i) => {
      const { condition, icon, weather } = mapWeatherCode(daily.weathercode?.[i] ?? 0);
      return {
        date,
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        precipitation: daily.precipitation_sum?.[i] ?? 0,
        condition,
        icon,
        weather,
      };
    });

    const forecast: WeatherForecast = { location: 'Madrid', days };
    return NextResponse.json(forecast);
  } catch {
    return NextResponse.json(mockForecast());
  }
}
