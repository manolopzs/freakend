export type ExperienceType = 'food' | 'nightlife' | 'culture' | 'adventure' | 'wellness' | 'sports' | 'concerts';
export type Vibe = 'solo' | 'date' | 'group';
export type Budget = 1 | 2 | 3 | 4;
export type DareLevel = 1 | 2 | 3 | 4 | 5;

export interface Experience {
  id: string;
  title: string;
  description: string;
  type: ExperienceType;
  budget: Budget;
  distanceKm: number;
  neighborhood: string;
  vibe: Vibe;
  dareLevel: DareLevel;
  emoji: string;
  address: string;
  whySpecial: string;
  ieHook?: string;
  photoUrl?: string | null;
  mapUrl?: string;
  coordinates?: { lat: number; lng: number };
  source: 'curated' | 'google' | 'ticketmaster' | 'madrid' | 'dondego';
  eventUrl?: string;
}

export interface Filters {
  types: ExperienceType[];
  budget: Budget;
  maxDistance: number;
  vibe: Vibe | 'any';
  dareLevel: DareLevel | 'any';
  /** YYYY-MM-DD, null = any time. */
  date: string | null;
}

export interface Comment {
  id: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface CompletedExperience {
  id: string;
  completedAt: string;
  rating: number;
  dareLevel: DareLevel;
  type: ExperienceType;
  budget: Budget;
  vibe: Vibe;
  caption?: string;
  photoUrl?: string;
  sharedWith?: string[];
  vibeRating?: number;
  valueRating?: number;
  uniquenessRating?: number;
  tags?: string[];
  notes?: string;
  comments?: Comment[];
  reactions?: Record<string, string[]>;
}

export interface Plan {
  id: string;
  experienceId: string;
  createdAt: string;
  attendees: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  cohort: string;
  points: number;
  level: number;
  streak: number;
  lastCompletedDate: string | null;
  completed: CompletedExperience[];
  badges: string[];
  friends: string[];
  saved: string[];
  plans: Plan[];
  avatarEmoji?: string;
}

export interface FriendProfile {
  name: string;
  email: string;
  cohort: string;
  points: number;
  level: number;
  avatarEmoji: string;
  completed: CompletedExperience[];
}

export interface LeaderboardUser {
  name: string;
  cohort: string;
  points: number;
  level: number;
  dares: number;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (profile: UserProfile) => boolean;
}

export interface Level {
  level: number;
  name: string;
  minPoints: number;
}

export type WeatherCondition = 'sunny' | 'rain' | 'snow' | 'storm';

export interface WeatherDay {
  /** YYYY-MM-DD (Europe/Madrid). */
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  condition: string;
  icon: string;
  /** Drives the animated background. */
  weather: WeatherCondition;
}

export interface WeatherForecast {
  location: string;
  days: WeatherDay[];
}
