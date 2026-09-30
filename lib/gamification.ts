import { UserProfile, CompletedExperience, Badge, Level, Experience, DareLevel, ExperienceType } from '@/lib/types';

export const LEVELS: Level[] = [
  { level: 1, name: 'Freshman', minPoints: 0 },
  { level: 2, name: 'Weekender', minPoints: 100 },
  { level: 3, name: 'City Explorer', minPoints: 250 },
  { level: 4, name: 'Madrid Insider', minPoints: 500 },
  { level: 5, name: 'Cultural Nomad', minPoints: 800 },
  { level: 6, name: 'Madrid Master', minPoints: 1200 },
  { level: 7, name: 'IE Legend', minPoints: 1800 },
];

export const BADGES: Badge[] = [
  {
    id: 'first-dare',
    name: 'First Dare',
    description: 'Complete your first Madrid dare.',
    emoji: '🎯',
    condition: (p) => p.completed.length >= 1,
  },
  {
    id: 'triple-streak',
    name: 'On a Roll',
    description: 'Complete dares 3 days in a row.',
    emoji: '🔥',
    condition: (p) => p.streak >= 3,
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'Complete 5 food & drink dares.',
    emoji: '🍴',
    condition: (p) => countByType(p.completed, 'food') >= 5,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 5 nightlife dares.',
    emoji: '🌙',
    condition: (p) => countByType(p.completed, 'nightlife') >= 5,
  },
  {
    id: 'culture-vulture',
    name: 'Culture Vulture',
    description: 'Complete 5 culture dares.',
    emoji: '🎭',
    condition: (p) => countByType(p.completed, 'culture') >= 5,
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Complete 5 adventure dares.',
    emoji: '🧭',
    condition: (p) => countByType(p.completed, 'adventure') >= 5,
  },
  {
    id: 'wellness-warrior',
    name: 'Zen Master',
    description: 'Complete 3 wellness dares.',
    emoji: '🧘',
    condition: (p) => countByType(p.completed, 'wellness') >= 3,
  },
  {
    id: 'bold-move',
    name: 'Bold Move',
    description: 'Complete a dare with dare level 4 or higher.',
    emoji: '🦁',
    condition: (p) => p.completed.some((c) => c.dareLevel >= 4),
  },
  {
    id: 'budget-hero',
    name: 'Budget Hero',
    description: 'Complete 10 dares that cost € or €€.',
    emoji: '💶',
    condition: (p) => p.completed.filter((c) => c.budget <= 2).length >= 10,
  },
  {
    id: 'solo-traveler',
    name: 'Solo Traveler',
    description: 'Complete 5 solo dares.',
    emoji: '🧍',
    condition: (p) => p.completed.filter((c) => c.vibe === 'solo').length >= 5,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Reach 100 total points.',
    emoji: '💯',
    condition: (p) => p.points >= 100,
  },
  {
    id: 'master',
    name: 'Madrid Master',
    description: 'Reach level 6.',
    emoji: '👑',
    condition: (p) => p.level >= 6,
  },
];

function countByType(completed: CompletedExperience[], type: ExperienceType): number {
  return completed.filter((c) => c.type === type).length;
}

export function calculatePoints(experience: Experience, streak: number): number {
  let points = 20;
  points += experience.dareLevel * 10;
  points += experience.budget * 5;
  points += streak * 5;
  return points;
}

export function updateStreak(profile: UserProfile): number {
  if (!profile.lastCompletedDate) return 1;

  const last = new Date(profile.lastCompletedDate);
  const today = new Date();
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return profile.streak;
  if (diffDays === 1) return profile.streak + 1;
  return 1;
}

export function computeLevel(points: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.minPoints) current = level;
  }
  return current;
}

export function computeProgressToNext(points: number): { current: Level; next: Level | null; progressPercent: number } {
  const current = computeLevel(points);
  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] || null;

  if (!next) {
    return { current, next: null, progressPercent: 100 };
  }

  const range = next.minPoints - current.minPoints;
  const earned = points - current.minPoints;
  const progressPercent = Math.min(100, Math.round((earned / range) * 100));
  return { current, next, progressPercent };
}

export function checkNewBadges(profile: UserProfile): Badge[] {
  return BADGES.filter((badge) => badge.condition(profile) && !profile.badges.includes(badge.id));
}
