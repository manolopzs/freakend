'use client';

import { useEffect, useMemo, useState } from 'react';
import { Experience, Filters, UserProfile } from '@/lib/types';
import { curatedExperiences } from '@/data/experiences';
import { loadFilters, loadProfile, saveFilters, saveProfile, getDefaultProfile } from '@/lib/storage';
import { calculatePoints, updateStreak, computeLevel, checkNewBadges, BADGES } from '@/lib/gamification';
import ProfileHeader from '@/components/ProfileHeader';
import FilterPanel from '@/components/FilterPanel';
import SurpriseCard from '@/components/SurpriseCard';
import BadgeGrid from '@/components/BadgeGrid';
import CompletedList from '@/components/CompletedList';
import NewBadgeToast from '@/components/NewBadgeToast';
import AuthModal from '@/components/AuthModal';
import Leaderboard from '@/components/Leaderboard';
import { Sparkles, LogOut, Globe, Crown } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [surprise, setSurprise] = useState<Experience | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>(curatedExperiences);
  const [liveMeta, setLiveMeta] = useState<{ liveCount: number; apis: Record<string, boolean> } | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(loadProfile());
    setFilters(loadFilters());
  }, []);

  useEffect(() => {
    if (filters) saveFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (profile) saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (!filters) return;

    const fetchLive = async () => {
      setLoadingLive(true);
      try {
        const types = filters.types.join(',');
        const res = await fetch(`/api/experiences?types=${encodeURIComponent(types)}`);
        const data = await res.json();
        setExperiences(data.experiences);
        setLiveMeta({ liveCount: data.meta.liveCount, apis: data.meta.apis });
      } catch {
        setExperiences(curatedExperiences);
        setLiveMeta(null);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLive();
  }, [filters?.types]);

  const filteredExperiences = useMemo(() => {
    if (!filters) return [];
    return experiences.filter((exp) => {
      if (filters.types.length > 0 && !filters.types.includes(exp.type)) return false;
      if (exp.budget > filters.budget) return false;
      if (filters.maxDistance < 100 && exp.distanceKm > filters.maxDistance) return false;
      if (filters.vibe !== 'any' && exp.vibe !== filters.vibe) return false;
      if (filters.dareLevel !== 'any' && exp.dareLevel !== filters.dareLevel) return false;
      return true;
    });
  }, [filters, experiences]);

  const generateSurprise = () => {
    if (!filters || filteredExperiences.length === 0) return;
    setIsGenerating(true);
    setSurprise(null);

    setTimeout(() => {
      const random = filteredExperiences[Math.floor(Math.random() * filteredExperiences.length)];
      setSurprise(random);
      setIsGenerating(false);
    }, 700);
  };

  const acceptDare = () => {
    if (!surprise || !profile) return;

    const streak = updateStreak(profile);
    const pointsEarned = calculatePoints(surprise, streak);
    const completedAt = new Date().toISOString();

    const nextCompleted = [
      ...profile.completed,
      {
        id: surprise.id,
        completedAt,
        rating: 0,
        dareLevel: surprise.dareLevel,
        type: surprise.type,
        budget: surprise.budget,
        vibe: surprise.vibe,
      },
    ];

    const nextProfile: UserProfile = {
      ...profile,
      points: profile.points + pointsEarned,
      streak,
      lastCompletedDate: completedAt,
      completed: nextCompleted,
    };

    nextProfile.level = computeLevel(nextProfile.points).level;

    const newlyEarned = checkNewBadges(nextProfile);
    if (newlyEarned.length > 0) {
      nextProfile.badges = [...nextProfile.badges, ...newlyEarned.map((b) => b.id)];
      setNewBadges((prev) => [...prev, ...newlyEarned.map((b) => b.id)]);
    }

    setProfile(nextProfile);
    setSurprise(null);
  };

  const skipDare = () => {
    setSurprise(null);
  };

  const dismissBadge = () => {
    setNewBadges((prev) => prev.slice(1));
  };

  const handleLogin = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleLogout = () => {
    setProfile(getDefaultProfile());
    setSurprise(null);
    saveProfile(getDefaultProfile());
  };

  if (!mounted || !profile || !filters) {
    return (
      <main className="min-h-screen bg-freak-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-16 h-16">
            <Crown className="w-16 h-16 text-freak-yellow animate-neon-pulse" />
            <Sparkles className="w-6 h-6 text-freak-pink absolute -top-1 -right-2 animate-pulse" />
          </div>
          <p className="mt-3 text-white/80 font-bold tracking-wider uppercase">Loading Freakend...</p>
        </div>
      </main>
    );
  }

  const isLoggedIn = !!profile.email;
  const currentBadge = newBadges.length > 0 ? newBadges[0] : null;
  const badge = currentBadge ? BADGES.find((b) => b.id === currentBadge) : undefined;

  return (
    <main className="min-h-screen bg-freak-bg">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-freak-bg/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-freak-pink to-freak-purple flex items-center justify-center shadow-neon-pink">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-freak-yellow rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="comic-text text-2xl leading-none gradient-text">FREAKEND</h1>
              <p className="text-[10px] text-freak-cyan font-bold tracking-widest uppercase">One pull away from a story.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {liveMeta && liveMeta.liveCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-freak-cyan bg-freak-cyan/10 border border-freak-cyan/30 px-2.5 py-1 rounded-full">
                <Globe className="w-3 h-3" />
                {liveMeta.liveCount} LIVE
              </div>
            )}
            <div className="text-sm font-black text-freak-yellow neon-text-yellow">
              {profile.points} PTS
            </div>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-white/60 hover:text-freak-pink flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> EXIT
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader profile={profile} />

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <FilterPanel filters={filters} onChange={setFilters} />
            {loadingLive && (
              <div className="text-xs font-bold text-freak-cyan flex items-center gap-2">
                <Sparkles className="w-3 h-3 animate-spin" /> SCANNING LIVE EVENTS...
              </div>
            )}
            <Leaderboard profile={profile} />
            <BadgeGrid profile={profile} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <SurpriseCard
              experience={surprise}
              isGenerating={isGenerating}
              hasMatches={filteredExperiences.length > 0}
              onGenerate={generateSurprise}
              onAccept={acceptDare}
              onSkip={skipDare}
            />

            {filteredExperiences.length === 0 && (
              <div className="comic-panel border-l-4 border-l-freak-yellow p-4 text-sm text-white/90">
                <span className="font-black text-freak-yellow uppercase">No matches!</span>{' '}
                Loosen your filters to unlock a dare.
              </div>
            )}

            <CompletedList profile={profile} experiences={experiences} />
          </div>
        </div>
      </div>

      {badge && <NewBadgeToast badge={badge} onClose={dismissBadge} />}

      {!isLoggedIn && <AuthModal onLogin={handleLogin} />}
    </main>
  );
}
