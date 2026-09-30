import { UserProfile, Filters } from '@/lib/types';

const PROFILE_KEY = 'madrid-dare-profile';
const FILTERS_KEY = 'madrid-dare-filters';

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
    types: ['food', 'nightlife', 'culture', 'adventure', 'wellness'],
    budget: 4,
    maxDistance: 100,
    vibe: 'any',
    dareLevel: 'any',
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
