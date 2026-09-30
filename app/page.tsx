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
import { Sparkles, LogOut, Globe } from 'lucide-react';

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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-ie-red mx-auto animate-bounce" />
          <p className="mt-3 text-gray-600 font-medium">Loading Freakend...</p>
        </div>
      </main>
    );
  }

  const isLoggedIn = !!profile.email;
  const currentBadge = newBadges.length > 0 ? newBadges[0] : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-ie-red text-white p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Freakend</h1>
              <p className="text-xs text-gray-500">IE Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {liveMeta && liveMeta.liveCount > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Globe className="w-3 h-3" />
                {liveMeta.liveCount} live results
              </div>
            )}
            <div className="text-sm font-semibold text-ie-red">
              {profile.points} pts
            </div>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-ie-red flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Logout
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
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3 animate-spin" /> Searching live events...
              </div>
            )}
            <Leaderboard profile={profile} />
            <BadgeGrid profile={profile} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <SurpriseCard
              experience={surprise}
              isGenerating={isGenerating}
              onGenerate={generateSurprise}
              onAccept={acceptDare}
              onSkip={skipDare}
            />

            {filteredExperiences.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
                No experiences match your filters. Try widening your budget, distance, or dare level.
              </div>
            )}

            <CompletedList profile={profile} experiences={experiences} />
          </div>
        </div>
      </div>

      {currentBadge && (
        <NewBadgeToast
          badge={BADGES.find((b) => b.id === currentBadge)!}
          onClose={dismissBadge}
        />
      )}

      {!isLoggedIn && <AuthModal onLogin={handleLogin} />}
    </main>
  );
}
