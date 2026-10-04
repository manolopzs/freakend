import { NextRequest, NextResponse } from 'next/server';
import { Experience, ExperienceType, Budget, DareLevel } from '@/lib/types';

// Live data changes constantly — never cache the route or the upstream fetches.
export const dynamic = 'force-dynamic';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const TICKETMASTER_KEY = process.env.TICKETMASTER_API_KEY || '';
const UNSPLASH_KEY = process.env.UNSPLASH_API_KEY || '';

// Optional Spanish -> English translation. Set in .env to enable.
// Production recommendation: Google Cloud Translation API or LibreTranslate.
// Falls back to free MyMemory API if nothing is configured.
const TRANSLATION_API_URL = process.env.TRANSLATION_API_URL || '';
const TRANSLATION_API_KEY = process.env.TRANSLATION_API_KEY || '';

// Madrid open data: agenda de actividades y eventos (free, no key).
const MADRID_AGENDA_URL =
  'https://datos.madrid.es/egob/catalogo/300107-0-agenda-actividades-eventos.csv';

// DondeGo public API (free, no key). Verified locations: barcelona, madrid.
const DONDE_GO_BASE = 'https://dondego.es/public-api/v1.4';

const IE_LAT = 40.4168;
const IE_LNG = -3.7038;

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

const fallbackPhotoByType: Record<ExperienceType, string> = {
  food: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c1?w=800&q=80',
  nightlife: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
  culture: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80',
  wellness: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-1e7668d16b87?w=800&q=80',
  concerts: 'https://images.unsplash.com/photo-1459749411177-0473ef716175?w=800&q=80',
};

function getPhotoUrl(type: ExperienceType, photoUrl?: string | null): string | null {
  return photoUrl || fallbackPhotoByType[type] || null;
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Try Unsplash API for a real photo matching the event title.
// If no key or no results, fall back to a deterministic random Picsum photo
// so every Madrid event still gets a unique image.
async function searchMadridPhotoUrl(title: string): Promise<string> {
  if (UNSPLASH_KEY) {
    try {
      const query = encodeURIComponent(`Madrid ${title}`);
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${UNSPLASH_KEY}`,
        { signal: AbortSignal.timeout(8000), cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        const url = data.results?.[0]?.urls?.small;
        if (url) return url;
      }
    } catch {
      // fall through
    }
  }
  return `https://picsum.photos/seed/${hashCode(title)}/800/600`;
}

function assignDareLevel(type: ExperienceType, title: string): DareLevel {
  const t = title.toLowerCase();
  const has = (kw: string) => t.includes(kw);

  if (type === 'concerts' || type === 'nightlife') {
    if (
      has('festival') ||
      has('rave') ||
      has('techno') ||
      has('metal') ||
      has('hardcore') ||
      has('punk') ||
      has('dj ') ||
      has('dj-set') ||
      has('after') ||
      has('fiesta') ||
      has('party') ||
      has('noche') ||
      has('night')
    )
      return 5;
    return 4;
  }

  if (type === 'adventure' || type === 'sports') return 3;
  if (type === 'food' || type === 'wellness') return 2;
  return 2;
}

// datos.madrid.es occasionally emits relative content URLs — make them absolute.
function absoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/')) return `https://datos.madrid.es${url}`;
  return url;
}

async function fetchGooglePlaces(type: ExperienceType): Promise<Experience[]> {
  if (!GOOGLE_API_KEY) return [];

  const keyword = typeToGoogleKeyword[type];
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${IE_LAT},${IE_LNG}&radius=10000&keyword=${keyword}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
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
  } catch (err) {
    console.error('Google Places fetch failed:', err);
    return [];
  }
}

async function fetchTicketmaster(date: string | null): Promise<Experience[]> {
  if (!TICKETMASTER_KEY) return [];

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=Madrid&countryCode=ES&apikey=${TICKETMASTER_KEY}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const events = data._embedded?.events || [];

    const filtered = events
      .filter((event: any) => (date ? event.dates?.start?.localDate === date : true))
      .slice(0, 6);

    const titles = filtered.map((event: any) => event.name || '');
    const descriptions = filtered.map(
      (event: any) =>
        `Live show or concert in Madrid via Ticketmaster. ${
          event.dates?.start?.localDate ? 'On ' + event.dates.start.localDate + '.' : ''
        }`
    );

    const [translatedTitles, translatedDescriptions] = await Promise.all([
      translateTexts(titles),
      translateTexts(descriptions),
    ]);

    return filtered.map((event: any, i: number): Experience => {
      const title = translatedTitles[i] || event.name;
      const type: ExperienceType = 'concerts';
      return {
        id: `ticketmaster-${event.id || i}`,
        title,
        description: translatedDescriptions[i] || descriptions[i],
        type,
        budget: event.priceRanges?.[0]?.min > 50 ? 3 : 2,
        distanceKm: 4,
        neighborhood: event._embedded?.venues?.[0]?.name || 'Madrid',
        vibe: 'group',
        dareLevel: assignDareLevel(type, title),
        emoji: '🎫',
        address: event._embedded?.venues?.[0]?.address?.line1 || 'Madrid',
        whySpecial: `${event.dates?.start?.localDate ? 'On ' + event.dates.start.localDate : ''} at ${event._embedded?.venues?.[0]?.name || 'a Madrid venue'}.`,
        photoUrl: getPhotoUrl(type, event.images?.[0]?.url),
        mapUrl: event.url,
        eventUrl: event.url,
        source: 'ticketmaster',
      };
    });
  } catch (err) {
    console.error('Ticketmaster fetch failed:', err);
    return [];
  }
}

// --- Madrid open data agenda (CSV) ---

// Minimal CSV parser: handles quoted fields, escaped quotes, and CRLF/LF rows.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ';') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// FECHA/FECHA-FIN come as "2026-11-07 00:00:00.0" or 25/12/2026 (day/month/year).
function parseMadridDate(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  let m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);

  m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function mapMadridType(tipo: string): { type: ExperienceType; emoji: string } {
  const t = tipo.toLowerCase();
  if (t.includes('musica') || t.includes('concierto')) return { type: 'concerts', emoji: '🎸' };
  if (t.includes('danza') || t.includes('baile')) return { type: 'culture', emoji: '💃' };
  if (t.includes('teatro') || t.includes('performance') || t.includes('circo')) return { type: 'culture', emoji: '🎭' };
  if (t.includes('cine')) return { type: 'culture', emoji: '🎬' };
  if (t.includes('exposicion')) return { type: 'culture', emoji: '🖼️' };
  if (t.includes('excursion') || t.includes('itinerario') || t.includes('ambiental') || t.includes('naturaleza'))
    return { type: 'adventure', emoji: '🥾' };
  if (t.includes('fiesta')) return { type: 'nightlife', emoji: '🎉' };
  return { type: 'culture', emoji: '🎟️' };
}

function parseMadridBudget(gratuito: string, precio: string): Budget {
  if (gratuito === '1') return 1;
  const m = precio.replace(/\s/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  if (!m) return 2;
  const value = parseFloat(m[0]);
  if (value <= 5) return 1;
  if (value <= 15) return 2;
  if (value <= 30) return 3;
  return 4;
}

function formatMadridDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

async function fetchMadridAgenda(date: string | null): Promise<{ events: Experience[]; ok: boolean }> {
  try {
    const res = await fetch(MADRID_AGENDA_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { events: [], ok: false };

    const text = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer());
    const rows = parseCsv(text);
    if (rows.length < 2) return { events: [], ok: false };

    const header = rows[0];
    const col = (name: string) => header.indexOf(name);
    const C = {
      id: col('ID-EVENTO'),
      title: col('TITULO'),
      precio: col('PRECIO'),
      gratuito: col('GRATUITO'),
      fecha: col('FECHA'),
      fechaFin: col('FECHA-FIN'),
      descripcion: col('DESCRIPCION'),
      contentUrl: col('CONTENT-URL'),
      tituloActividad: col('TITULO-ACTIVIDAD'),
      urlActividad: col('URL-ACTIVIDAD'),
      urlInstalacion: col('URL-INSTALACION'),
      nombreInstalacion: col('NOMBRE-INSTALACION'),
      claseVia: col('CLASE-VIAL-INSTALACION'),
      nombreVia: col('NOMBRE-VIA-INSTALACION'),
      numVia: col('NUM-INSTALACION'),
      distrito: col('DISTRITO-INSTALACION'),
      barrio: col('BARRIO-INSTALACION'),
      lat: col('LATITUD'),
      lng: col('LONGITUD'),
      tipo: col('TIPO'),
    };

    const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

    const now = new Date();

    // Selected-day bounds (local time), when a date filter is active.
    let dayStart: Date | null = null;
    let dayEnd: Date | null = null;
    if (date) {
      const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        dayStart = new Date(+m[1], +m[2] - 1, +m[3]);
        dayEnd = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59, 999);
      }
    }

    const seen = new Set<string>();
    const rawEvents: {
      id: string;
      title: string;
      description: string;
      type: ExperienceType;
      emoji: string;
      budget: Budget;
      distanceKm: number;
      neighborhood: string;
      address: string;
      whySpecial: string;
      mapUrl: string;
      eventUrl: string;
      coordinates?: { lat: number; lng: number };
      start: number;
    }[] = [];

    for (const r of rows.slice(1)) {
      const title = get(r, C.title) || get(r, C.tituloActividad);
      if (!title) continue;

      const id = get(r, C.id) || title;
      if (seen.has(id)) continue;

      const start = parseMadridDate(get(r, C.fecha));
      const end = parseMadridDate(get(r, C.fechaFin)) ?? start;
      if (end && end < now) continue; // already over

      if (dayStart) {
        if (!start && !end) continue;
        if (start && start > dayEnd!) continue; // starts after the selected day
        if (end && end < dayStart) continue; // ended before the selected day
      }

      const { type, emoji } = mapMadridType(get(r, C.tipo));
      const gratuito = get(r, C.gratuito);
      const precio = get(r, C.precio);
      const neighborhood = get(r, C.distrito) || get(r, C.barrio) || 'Madrid';
      const venue = get(r, C.nombreInstalacion);
      const addressParts = [
        get(r, C.claseVia),
        [get(r, C.nombreVia), get(r, C.numVia)].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(' ');
      const address = addressParts ? `${addressParts}, Madrid` : neighborhood;

      const lat = parseFloat(get(r, C.lat));
      const lng = parseFloat(get(r, C.lng));
      const hasCoords = !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

      const cleanDescription = get(r, C.descripcion)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const dateLabel =
        start && end && end.getTime() !== start.getTime()
          ? `${formatMadridDate(start)} – ${formatMadridDate(end)}`
          : start
          ? formatMadridDate(start)
          : 'Check dates';

      const mapUrl =
        absoluteUrl(get(r, C.urlInstalacion)) ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

      seen.add(id);
      rawEvents.push({
        id: `madrid-${id}`,
        title,
        description: cleanDescription.slice(0, 200) || `City-run ${type} event in ${neighborhood}.`,
        type,
        emoji,
        budget: parseMadridBudget(gratuito, precio),
        distanceKm: hasCoords ? Math.round(distanceToIE(lat, lng) * 10) / 10 : 3,
        neighborhood,
        address,
        whySpecial: `${gratuito === '1' ? 'Free entry' : 'Paid entry'} • ${dateLabel}${
          venue ? ` • ${venue}` : ''
        }`,
        mapUrl,
        eventUrl:
          absoluteUrl(get(r, C.urlActividad)) ||
          absoluteUrl(get(r, C.contentUrl)) ||
          mapUrl,
        coordinates: hasCoords ? { lat, lng } : undefined,
        start: start?.getTime() ?? Number.POSITIVE_INFINITY,
      });
    }

    // Only translate/decorate the events we will actually return.
    const upcomingRaw = rawEvents
      .sort((a, b) => a.start - b.start)
      .slice(0, 24);

    const titles = upcomingRaw.map((r) => r.title);
    const descriptions = upcomingRaw.map((r) => r.description);
    const [translatedTitles, translatedDescriptions, photoUrls] = await Promise.all([
      translateTexts(titles),
      translateTexts(descriptions),
      Promise.all(upcomingRaw.map((r) => searchMadridPhotoUrl(r.title))),
    ]);

    const upcoming: Experience[] = upcomingRaw.map((r, i) => {
      const title = translatedTitles[i] || r.title;
      return {
        id: r.id,
        title,
        description: translatedDescriptions[i] || r.description,
        type: r.type,
        budget: r.budget,
        distanceKm: r.distanceKm,
        neighborhood: r.neighborhood,
        vibe: r.type === 'culture' ? 'date' : 'group',
        dareLevel: assignDareLevel(r.type, title),
        emoji: r.emoji,
        address: r.address,
        whySpecial: r.whySpecial,
        coordinates: r.coordinates,
        mapUrl: r.mapUrl,
        eventUrl: r.eventUrl,
        photoUrl: getPhotoUrl(r.type, photoUrls[i]),
        source: 'madrid',
      };
    });

    return { events: upcoming, ok: true };
  } catch (err) {
    console.error('Madrid agenda processing failed:', err);
    return { events: [], ok: false };
  }
}

function distanceToIE(lat: number, lng: number): number {
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

// --- Optional Spanish -> English translation ---
// Supports Google Cloud Translation API, LibreTranslate, the undocumented
// clients5.google.com endpoint, and a free MyMemory fallback.
async function translateTexts(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return texts;

  // 1. Configured provider (if any).
  if (TRANSLATION_API_URL) {
    try {
      if (TRANSLATION_API_URL.includes('translation.googleapis.com')) {
        return await translateWithGoogleCloud(texts);
      }
      if (TRANSLATION_API_URL.includes('clients5.google.com')) {
        return await translateWithGoogle(texts);
      }
      return await translateWithLibreTranslate(texts);
    } catch (err) {
      console.error('Configured translation provider failed:', err);
    }
  }

  // 2. Free fallback: MyMemory (works from most serverless hosts).
  try {
    return await translateWithMyMemory(texts);
  } catch (err) {
    console.error('MyMemory translation fallback failed:', err);
  }

  return texts;
}

async function translateText(text: string): Promise<string> {
  const [result] = await translateTexts([text]);
  return result;
}

async function translateWithGoogleCloud(texts: string[]): Promise<string[]> {
  const body = {
    q: texts,
    source: 'es',
    target: 'en',
    format: 'text',
    key: TRANSLATION_API_KEY,
  };
  const res = await fetch(TRANSLATION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google Cloud HTTP ${res.status}`);
  const data = await res.json();
  const translations = data.data?.translations || [];
  return translations.map((t: any, i: number) => t.translatedText || texts[i]);
}

async function translateWithLibreTranslate(texts: string[]): Promise<string[]> {
  const body: Record<string, any> = {
    q: texts,
    source: 'es',
    target: 'en',
    format: 'text',
  };
  if (TRANSLATION_API_KEY) body.api_key = TRANSLATION_API_KEY;
  const res = await fetch(TRANSLATION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data.translatedText)) {
    return data.translatedText.map((t: any, i: number) =>
      typeof t === 'string' && t.trim() ? t : texts[i]
    );
  }
  if (typeof data.translatedText === 'string') {
    return texts.map((original, i) => (i === 0 ? data.translatedText : original));
  }
  throw new Error('Unexpected LibreTranslate response shape');
}

// Undocumented Google Translate browser endpoint. Often blocked on serverless IPs.
async function translateWithGoogle(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return texts;
  const results: string[] = [];
  const chunkSize = 8;
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    const translated = await translateWithGoogleChunk(chunk);
    results.push(...translated);
  }
  return results;
}

async function translateWithGoogleChunk(texts: string[]): Promise<string[]> {
  const nonEmpty = texts.map((t) => t || '');
  if (nonEmpty.length === 0) return texts;
  const params = new URLSearchParams({
    client: 'dict-chrome-ex',
    sl: 'es',
    tl: 'en',
    dt: 't',
  });
  nonEmpty.forEach((t) => params.append('q', t));
  const res = await fetch(`${TRANSLATION_API_URL}?${params.toString()}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google clients5 HTTP ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) {
    if (data.length > 0 && data.every((item: any) => typeof item === 'string')) {
      return data.map((t: any, i: number) => (t && String(t).trim() ? t : texts[i]));
    }
    return data.map((chunk: any, i: number) => {
      const sentences = chunk?.map((item: any) => item?.[0]).filter(Boolean) || [];
      return sentences.join('') || texts[i];
    });
  }
  if (data?.sentences) {
    return [data.sentences.map((s: any) => s.trans).join('') || texts[0]];
  }
  throw new Error('Unexpected Google clients5 response shape');
}

// MyMemory free translation API. Anonymous usage is limited but works from servers.
async function translateWithMyMemory(texts: string[]): Promise<string[]> {
  const results: string[] = [];
  // Run in small batches to avoid rate limits.
  const batchSize = 4;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const translated = await Promise.all(
      batch.map(async (text) => {
        if (!text) return text;
        try {
          const q = encodeURIComponent(text);
          const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${q}&langpair=es|en`,
            { signal: AbortSignal.timeout(8000), cache: 'no-store' }
          );
          if (!res.ok) return text;
          const data = await res.json();
          return data.responseData?.translatedText || text;
        } catch {
          return text;
        }
      })
    );
    results.push(...translated);
  }
  return results;
}

// --- DondeGo (Madrid events) ---
function mapDondeGoCategory(categories: string[]): { type: ExperienceType; emoji: string } {
  const cats = categories.map((c) => c.toLowerCase());
  if (cats.some((c) => c.includes('musica') || c.includes('concierto') || c.includes('concert')))
    return { type: 'concerts', emoji: '🎸' };
  if (cats.some((c) => c.includes('teatro') || c.includes('danca') || c.includes('danza') || c.includes('exposicion') || c.includes('arte') || c.includes('cine')))
    return { type: 'culture', emoji: '🎭' };
  if (cats.some((c) => c.includes('fiesta') || c.includes('night') || c.includes('club') || c.includes('bar')))
    return { type: 'nightlife', emoji: '🍸' };
  if (cats.some((c) => c.includes('deporte') || c.includes('sport')))
    return { type: 'sports', emoji: '⚽' };
  if (cats.some((c) => c.includes('gastronomia') || c.includes('food') || c.includes('restaurante')))
    return { type: 'food', emoji: '🍽️' };
  if (cats.some((c) => c.includes('bienestar') || c.includes('wellness') || c.includes('spa')))
    return { type: 'wellness', emoji: '🧖' };
  if (cats.some((c) => c.includes('aventura') || c.includes('naturaleza') || c.includes('excursion')))
    return { type: 'adventure', emoji: '🥾' };
  return { type: 'culture', emoji: '🎟️' };
}

function parseDondeGoBudget(price: string | null, isFree: boolean | null): Budget {
  if (isFree) return 1;
  if (!price) return 2;
  const m = price.replace(/\s/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  if (!m) return 2;
  const val = parseFloat(m[0]);
  if (val <= 5) return 1;
  if (val <= 15) return 2;
  if (val <= 30) return 3;
  return 4;
}

function getDondeGoDateRange(dates: any[]): { start: Date | null; end: Date | null } {
  let start: Date | null = null;
  let end: Date | null = null;
  for (const d of dates) {
    if (d.start) {
      const t = new Date(d.start * 1000);
      if (!start || t < start) start = t;
    }
    if (d.end) {
      const t = new Date(d.end * 1000);
      if (!end || t > end) end = t;
    }
  }
  return { start, end };
}

type RawDondeGoEvent = Omit<Experience, 'title' | 'description' | 'dareLevel'> & {
  rawTitle: string;
  rawDescription: string;
};

async function fetchDondeGoEventDetail(id: number, date: string | null): Promise<RawDondeGoEvent | null> {
  try {
    const res = await fetch(`${DONDE_GO_BASE}/events/${id}/?expand=place,dates,images`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || !d.title) return null;

    const { start, end } = getDondeGoDateRange(d.dates || []);
    const now = new Date();
    if (end && end < now) return null;
    if (date && start && end) {
      const [y, m, day] = date.split('-').map(Number);
      const dayStart = new Date(y, m - 1, day);
      const dayEnd = new Date(y, m - 1, day, 23, 59, 59, 999);
      if (start > dayEnd || end < dayStart) return null;
    }

    const { type, emoji } = mapDondeGoCategory(d.categories || []);
    const place = d.place || {};
    const lat = place.coords?.lat;
    const lng = place.coords?.lon ?? place.coords?.lng;
    const hasCoords = typeof lat === 'number' && typeof lng === 'number';
    const neighborhood = place.location || place.address?.split(',')?.slice(-2)?.[0]?.trim() || 'Madrid';
    const address = place.address || neighborhood;

    const rawDescription = (d.description || d.body_text || d.tagline || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      id: `dondego-${id}`,
      rawTitle: d.title,
      rawDescription: rawDescription.slice(0, 220) || `${type} event in Madrid.`,
      type,
      budget: parseDondeGoBudget(d.price, d.is_free),
      distanceKm: hasCoords ? Math.round(distanceToIE(lat, lng) * 10) / 10 : 3,
      neighborhood,
      vibe: type === 'culture' ? 'date' : 'group',
      emoji,
      address,
      whySpecial: `Via DondeGo • ${d.price || (d.is_free ? 'Free' : 'Check price')}`,
      photoUrl: d.images?.[0]?.image || null,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      eventUrl: d.site_url,
      source: 'dondego',
    };
  } catch (err) {
    console.error(`DondeGo detail fetch failed for event ${id}:`, err);
    return null;
  }
}

async function fetchDondeGoEvents(date: string | null): Promise<{ events: Experience[]; ok: boolean }> {
  try {
    const res = await fetch(`${DONDE_GO_BASE}/events/?location=madrid&page_size=100`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error('DondeGo list fetch failed:', res.status, res.statusText);
      return { events: [], ok: false };
    }
    const data = await res.json();
    const results = data.results || [];

    const rawEvents: RawDondeGoEvent[] = [];
    const batchSize = 5;
    const maxBatches = 8; // cap at 40 detail requests to find future events while staying within serverless limits
    for (let i = 0; i < results.length && rawEvents.length < 16 && i < batchSize * maxBatches; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      const details = await Promise.all(batch.map((s: any) => fetchDondeGoEventDetail(s.id, date)));
      rawEvents.push(...(details.filter(Boolean) as RawDondeGoEvent[]));
    }

    const titles = rawEvents.map((r) => r.rawTitle);
    const descriptions = rawEvents.map((r) => r.rawDescription);
    const [translatedTitles, translatedDescriptions] = await Promise.all([
      translateTexts(titles),
      translateTexts(descriptions),
    ]);

    const events: Experience[] = rawEvents.map((r, i): Experience => {
      const title = translatedTitles[i] || r.rawTitle;
      const { rawTitle, rawDescription, ...rest } = r;
      return {
        ...rest,
        title,
        description: translatedDescriptions[i] || r.rawDescription,
        dareLevel: assignDareLevel(rest.type, title),
        photoUrl: getPhotoUrl(rest.type, rest.photoUrl),
      };
    });

    return { events: events.slice(0, 16), ok: true };
  } catch (err) {
    console.error('DondeGo events fetch failed:', err);
    return { events: [], ok: false };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typesParam = searchParams.get('types') || 'food,nightlife,culture,adventure,wellness,sports,concerts';
  const requestedTypes = typesParam.split(',').map((t) => t.trim()).filter(Boolean);
  const validTypes: ExperienceType[] = ['food', 'nightlife', 'culture', 'adventure', 'wellness', 'sports', 'concerts'];
  const types = requestedTypes.filter((t) => validTypes.includes(t as ExperienceType)) as ExperienceType[];

  const dateParam = searchParams.get('date');
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

  const eventTypes: ExperienceType[] = ['culture', 'nightlife', 'concerts', 'adventure'];
  const wantsEvents = types.some((t) => eventTypes.includes(t));
  const wantsTicketmaster = types.some((t) => ['culture', 'nightlife', 'concerts'].includes(t));
  const debug = searchParams.get('debug') === '1';

  // Fetch all live sources in parallel so a slow one doesn't block the others.
  const rawResults = await Promise.allSettled([
    Promise.all(types.map((type) => fetchGooglePlaces(type))).then((groups) => groups.flat()),
    wantsEvents ? fetchMadridAgenda(date) : Promise.resolve({ events: [], ok: true }),
    wantsEvents ? fetchDondeGoEvents(date) : Promise.resolve({ events: [], ok: true }),
    wantsEvents && wantsTicketmaster ? fetchTicketmaster(date) : Promise.resolve([]),
  ]);

  const [googleEventsResult, madridResult, dondegoResult, ticketmasterResult] = rawResults;
  const googleEvents = googleEventsResult.status === 'fulfilled' ? googleEventsResult.value : [];
  const madrid = madridResult.status === 'fulfilled' ? madridResult.value : { events: [], ok: false };
  const dondego = dondegoResult.status === 'fulfilled' ? dondegoResult.value : { events: [], ok: false };
  const ticketmasterEvents = ticketmasterResult.status === 'fulfilled' ? ticketmasterResult.value : [];

  const errors: string[] = [];
  if (debug) {
    if (googleEventsResult.status === 'rejected') errors.push(`google: ${String(googleEventsResult.reason)}`);
    if (madridResult.status === 'rejected') errors.push(`madrid: ${String(madridResult.reason)}`);
    if (dondegoResult.status === 'rejected') errors.push(`dondego: ${String(dondegoResult.reason)}`);
    if (ticketmasterResult.status === 'rejected') errors.push(`ticketmaster: ${String(ticketmasterResult.reason)}`);
  } else {
    // Always log rejections for observability.
    rawResults.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`API source ${i} failed:`, r.reason);
    });
  }

  const liveResults: Experience[] = [
    ...(Array.isArray(googleEvents) ? googleEvents : []),
    ...madrid.events,
    ...dondego.events,
    ...(Array.isArray(ticketmasterEvents) ? ticketmasterEvents : []),
  ];
  const madridOk = madrid.ok;
  const dondegoOk = dondego.ok;

  const filtered = liveResults.filter((exp) => types.includes(exp.type));

  return NextResponse.json({
    experiences: filtered,
    meta: {
      liveCount: filtered.length,
      apis: {
        google: !!GOOGLE_API_KEY,
        ticketmaster: !!TICKETMASTER_KEY,
        madrid: madridOk,
        dondego: dondegoOk,
      },
      ...(errors.length > 0 && { errors }),
    },
  });
}
