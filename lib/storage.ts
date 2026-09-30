import { UserProfile, Filters, FriendProfile, CompletedExperience } from '@/lib/types';

const PROFILE_KEY = 'madrid-dare-profile';
const FILTERS_KEY = 'madrid-dare-filters';
const FRIENDS_KEY = 'freakend-friends';

export function getDefaultProfile(): UserProfile {
  return {
    name: 'IE Explorer',
    email: '',
    cohort: '',
    points: 0,
    level: 1,
    streak: 0,
    lastCompletedDate: null,
    completed: [],
    badges: [],
    friends: loadFriends(),
    avatarEmoji: '🙂',
  };
}

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return getDefaultProfile();
  try {
    return { ...getDefaultProfile(), ...JSON.parse(raw) };
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getDefaultFilters(): Filters {
  return {
    types: ['food', 'nightlife', 'culture', 'adventure', 'wellness', 'sports', 'concerts'],
    budget: 4,
    maxDistance: 10,
    vibe: 'any',
    dareLevel: 'any',
    dateWindow: 'any',
  };
}

export function loadFilters(): Filters {
  if (typeof window === 'undefined') return getDefaultFilters();
  const raw = localStorage.getItem(FILTERS_KEY);
  if (!raw) return getDefaultFilters();
  try {
    return { ...getDefaultFilters(), ...JSON.parse(raw) };
  } catch {
    return getDefaultFilters();
  }
}

export function saveFilters(filters: Filters): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

export const DEMO_FRIENDS: FriendProfile[] = [
  {
    name: 'Sofia L.',
    email: 'sofia.l@student.ie.edu',
    cohort: 'MBA 2026',
    points: 420,
    level: 4,
    avatarEmoji: '👩‍🎓',
    completed: [
      {
        id: 'flamenco-corral',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        rating: 5,
        dareLevel: 2,
        type: 'culture',
        budget: 3,
        vibe: 'date',
        caption: 'The guitarist was unreal. Best date night in Madrid so far.',
        sharedWith: [],
      },
      {
        id: 'chueca-tapas',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        rating: 4,
        dareLevel: 2,
        type: 'nightlife',
        budget: 2,
        vibe: 'group',
        caption: 'Cohort night out got messy in the best way.',
        sharedWith: [],
      },
    ],
  },
  {
    name: 'Marco R.',
    email: 'marco.r@student.ie.edu',
    cohort: 'MBA 2026',
    points: 385,
    level: 4,
    avatarEmoji: '🧔‍♂️',
    completed: [
      {
        id: 'real-madrid-tour',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        rating: 4,
        dareLevel: 1,
        type: 'culture',
        budget: 3,
        vibe: 'group',
        caption: 'I am officially a Madridista now.',
        sharedWith: [],
      },
      {
        id: 'casa-campo-cable',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        rating: 5,
        dareLevel: 2,
        type: 'adventure',
        budget: 2,
        vibe: 'date',
        caption: 'Views for days. Highly recommend at sunset.',
        sharedWith: [],
      },
    ],
  },
  {
    name: 'Emma T.',
    email: 'emma.t@student.ie.edu',
    cohort: 'MBA 2026',
    points: 310,
    level: 3,
    avatarEmoji: '👩‍💼',
    completed: [
      {
        id: 'yoga-retiro',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        rating: 5,
        dareLevel: 1,
        type: 'wellness',
        budget: 1,
        vibe: 'solo',
        caption: 'Sunday reset before finals week.',
        sharedWith: [],
      },
      {
        id: 'prado-afterwork',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        rating: 4,
        dareLevel: 2,
        type: 'culture',
        budget: 1,
        vibe: 'solo',
        caption: 'Two hours with Velázquez. My brain needed this.',
        sharedWith: [],
      },
    ],
  },
];

export function getDefaultFriends(): string[] {
  return DEMO_FRIENDS.map((f) => f.email);
}

export function loadFriends(): string[] {
  if (typeof window === 'undefined') return getDefaultFriends();
  const raw = localStorage.getItem(FRIENDS_KEY);
  if (!raw) return getDefaultFriends();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return getDefaultFriends();
  } catch {
    return getDefaultFriends();
  }
}

export function saveFriends(friends: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export function loadAllProfiles(currentUser: UserProfile): FriendProfile[] {
  const friendEmails = new Set(currentUser.friends ?? loadFriends());
  const friends = DEMO_FRIENDS.filter((f) => friendEmails.has(f.email));
  const me: FriendProfile = {
    name: currentUser.name || 'You',
    email: currentUser.email || 'me',
    cohort: currentUser.cohort || '',
    points: currentUser.points,
    level: currentUser.level,
    avatarEmoji: currentUser.avatarEmoji || '🙂',
    completed: currentUser.completed,
  };
  return [me, ...friends];
}
