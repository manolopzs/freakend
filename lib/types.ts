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
  source: 'curated' | 'google' | 'eventbrite' | 'ticketmaster';
  eventUrl?: string;
}

export interface Filters {
  types: ExperienceType[];
  budget: Budget;
  maxDistance: number;
  vibe: Vibe | 'any';
  dareLevel: DareLevel | 'any';
  dateWindow: 'day' | 'weekend' | 'month' | 'any';
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
