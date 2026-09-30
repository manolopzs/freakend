import { NextRequest, NextResponse } from 'next/server';
import { Experience, ExperienceType, Budget, Vibe, DareLevel } from '@/lib/types';
import { curatedExperiences } from '@/data/experiences';

// TODO: Move API keys to server-only environment variables.
// They are currently only used in server-side requests, which is acceptable for an MVP.
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_API_TOKEN || '';
const TICKETMASTER_KEY = process.env.TICKETMASTER_API_KEY || '';

const typeToGoogleKeyword: Record<ExperienceType, string> = {
  food: 'restaurant',
  nightlife: 'bar',
  culture: 'museum',
  adventure: 'tourist_attraction',
  wellness: 'spa',
  sports: 'stadium',
  concerts: 'concert_hall',
};

const typeToBudget = (level: number): Budget => {
  if (level <= 1) return 1;
  if (level <= 2) return 2;
  if (level <= 3) return 3;
  return 4;
};

async function fetchGooglePlaces(type: ExperienceType): Promise<Experience[]> {
  if (!GOOGLE_API_KEY) return [];

  const keyword = typeToGoogleKeyword[type];
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.4168,-3.7038&radius=10000&keyword=${keyword}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.slice(0, 5).map((place: any, i: number): Experience => {
      const photoRef = place.photos?.[0]?.photo_reference;
      const photoUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`
        : null;

      return {
        id: `google-${place.place_id || i}`,
        title: place.name,
        description: `Top-rated ${keyword} near IE found via Google Places.`,
        type,
        budget: typeToBudget(place.price_level || 2),
        distanceKm: Math.round(((place.geometry?.location && distanceToIE(place.geometry.location.lat, place.geometry.location.lng)) || 2) * 10) / 10,
        neighborhood: place.vicinity?.split(',')?.slice(-2)?.[0]?.trim() || 'Madrid',
        vibe: type === 'wellness' ? 'solo' : type === 'nightlife' || type === 'concerts' ? 'group' : 'date',
        dareLevel: type === 'adventure' || type === 'sports' ? 3 : 2,
        emoji:
          type === 'food'
            ? '🍽️'
            : type === 'nightlife'
            ? '🍸'
            : type === 'culture'
            ? '🏛️'
            : type === 'adventure'
            ? '🎯'
            : type === 'sports'
            ? '⚽'
            : type === 'concerts'
            ? '🎸'
            : '🧖',
        address: place.vicinity || 'Madrid',
        whySpecial: `Rated ${place.rating || '?'} on Google with ${place.user_ratings_total || 0} reviews.`,
        photoUrl,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}`,
        coordinates: place.geometry?.location,
        source: 'google',
      };
    });
  } catch {
    return [];
  }
}

async function fetchEventbrite(dateWindow: DateWindow): Promise<Experience[]> {
  if (!EVENTBRITE_TOKEN) return [];

  const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=40.4168&location.longitude=-3.7038&location.within=10km&start_date.range_start=${new Date().toISOString().split('T')[0]}T00:00:00Z&token=${EVENTBRITE_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.events) return [];

    return data.events
      .filter((event: any) => matchesDateWindow(event, dateWindow))
      .slice(0, 4)
      .map((event: any, i: number): Experience => ({
      id: `eventbrite-${event.id || i}`,
      title: event.name.text,
      description: event.summary || 'Live event in Madrid via Eventbrite.',
      type: 'culture',
      budget: 2,
      distanceKm: 3,
      neighborhood: 'Madrid',
      vibe: 'group',
      dareLevel: 3,
      emoji: '🎟️',
      address: 'Madrid',
      whySpecial: `Happening soon: ${event.start?.local ? new Date(event.start.local).toLocaleDateString() : 'check date'}.`,
      mapUrl: `https://www.eventbrite.com/e/${event.id}`,
      eventUrl: event.url,
      source: 'eventbrite',
    }));
  } catch {
    return [];
  }
}

async function fetchTicketmaster(dateWindow: DateWindow): Promise<Experience[]> {
  if (!TICKETMASTER_KEY) return [];

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=Madrid&countryCode=ES&apikey=${TICKETMASTER_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const events = data._embedded?.events || [];

    return events
      .filter((event: any) => matchesDateWindow(event, dateWindow))
      .slice(0, 4)
      .map((event: any, i: number): Experience => ({
      id: `ticketmaster-${event.id || i}`,
      title: event.name,
      description: `Live show or concert in Madrid via Ticketmaster.`,
      type: 'nightlife',
      budget: event.priceRanges?.[0]?.min > 50 ? 3 : 2,
      distanceKm: 4,
      neighborhood: event._embedded?.venues?.[0]?.name || 'Madrid',
      vibe: 'group',
      dareLevel: 2,
      emoji: '🎫',
      address: event._embedded?.venues?.[0]?.address?.line1 || 'Madrid',
      whySpecial: `${event.dates?.start?.localDate ? 'On ' + event.dates.start.localDate : ''} at ${event._embedded?.venues?.[0]?.name || 'a Madrid venue'}.`,
      photoUrl: event.images?.[0]?.url || null,
      mapUrl: event.url,
      eventUrl: event.url,
      source: 'ticketmaster',
    }));
  } catch {
    return [];
  }
}

type DateWindow = 'day' | 'weekend' | 'month' | 'any';

function getDateWindowBounds(window: DateWindow): { start: Date; end: Date } | null {
  if (window === 'any') return null;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (window === 'day') {
    end.setHours(23, 59, 59, 999);
  } else if (window === 'weekend') {
    const day = start.getDay();
    const daysUntilFriday = day >= 5 ? 0 : 5 - day;
    start.setDate(start.getDate() + daysUntilFriday);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + (7 - start.getDay()) % 7);
    end.setHours(23, 59, 59, 999);
  } else if (window === 'month') {
    end.setDate(start.getDate() + 30);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

function parseEventDate(event: any): Date | null {
  const raw =
    event.dates?.start?.dateTime ||
    event.dates?.start?.localDate ||
    event.start?.local ||
    event.start?.utc;
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function matchesDateWindow(event: any, window: DateWindow): boolean {
  if (window === 'any') return true;
  const bounds = getDateWindowBounds(window);
  if (!bounds) return true;
  const eventDate = parseEventDate(event);
  if (!eventDate) return false;
  return eventDate >= bounds.start && eventDate <= bounds.end;
}

function distanceToIE(lat: number, lng: number): number {
  const IE_LAT = 40.4168;
  const IE_LNG = -3.7038;
  const R = 6371;
  const dLat = ((lat - IE_LAT) * Math.PI) / 180;
  const dLng = ((lng - IE_LNG) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((IE_LAT * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typesParam = searchParams.get('types') || 'food,nightlife,culture,adventure,wellness,sports,concerts';
  const requestedTypes = typesParam.split(',').map((t) => t.trim()).filter(Boolean);
  const validTypes: ExperienceType[] = ['food', 'nightlife', 'culture', 'adventure', 'wellness', 'sports', 'concerts'];
  const invalid = requestedTypes.filter((t) => !validTypes.includes(t as ExperienceType));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid experience type(s): ${invalid.join(', ')}` },
      { status: 400 }
    );
  }
  const types = requestedTypes as ExperienceType[];

  const dateWindowParam = searchParams.get('dateWindow') || 'any';
  const dateWindow: DateWindow = ['day', 'weekend', 'month'].includes(dateWindowParam)
    ? (dateWindowParam as DateWindow)
    : 'any';

  const liveResults: Experience[] = [];

  for (const type of types) {
    const places = await fetchGooglePlaces(type);
    liveResults.push(...places);
  }

  const eventTypes: ExperienceType[] = ['culture', 'nightlife', 'concerts'];
  if (types.some((t) => eventTypes.includes(t))) {
    liveResults.push(...(await fetchEventbrite(dateWindow)));
    liveResults.push(...(await fetchTicketmaster(dateWindow)));
  }

  const filteredCurated = curatedExperiences.filter((exp) => types.includes(exp.type));
  const all = [...filteredCurated, ...liveResults];

  return NextResponse.json({
    experiences: all,
    meta: {
      liveCount: liveResults.length,
      curatedCount: filteredCurated.length,
      apis: {
        google: !!GOOGLE_API_KEY,
        eventbrite: !!EVENTBRITE_TOKEN,
        ticketmaster: !!TICKETMASTER_KEY,
      },
    },
  });
}
