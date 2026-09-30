import { NextRequest, NextResponse } from 'next/server';

interface WeatherPayload {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

function getMockWeather(): WeatherPayload {
  return {
    temp: 22,
    condition: 'Sunny',
    icon: '☀️',
    location: 'Madrid',
  };
}

function mapOpenWeatherCondition(code: number): { condition: string; icon: string } {
  if (code >= 200 && code < 300) return { condition: 'Thunderstorm', icon: '⛈️' };
  if (code >= 300 && code < 400) return { condition: 'Drizzle', icon: '🌦️' };
  if (code >= 500 && code < 600) return { condition: 'Rain', icon: '🌧️' };
  if (code >= 600 && code < 700) return { condition: 'Snow', icon: '❄️' };
  if (code >= 700 && code < 800) return { condition: 'Mist', icon: '🌫️' };
  if (code === 800) return { condition: 'Clear', icon: '☀️' };
  if (code === 801) return { condition: 'Few clouds', icon: '🌤️' };
  if (code === 802 || code === 803) return { condition: 'Cloudy', icon: '⛅' };
  if (code === 804) return { condition: 'Overcast', icon: '☁️' };
  return { condition: 'Clear', icon: '☀️' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '40.4168');
  const lng = parseFloat(searchParams.get('lng') || '-3.7038');

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(getMockWeather());
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(getMockWeather());
    }
    const data = await res.json();
    const mapped = mapOpenWeatherCondition(data.weather?.[0]?.id ?? 800);

    const weather: WeatherPayload = {
      temp: Math.round(data.main?.temp ?? 22),
      condition: mapped.condition,
      icon: mapped.icon,
      location: data.name || 'Madrid',
    };

    return NextResponse.json(weather);
  } catch {
    return NextResponse.json(getMockWeather());
  }
}
