'use client';

import { useEffect, useMemo, useState } from 'react';
import { Experience, Filters, UserProfile } from '@/lib/types';

interface Weather {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}
import { curatedExperiences } from '@/data/experiences';
import { loadFilters, loadProfile, saveFilters, saveProfile, loadAllProfiles, getDefaultProfile } from '@/lib/storage';
import { calculatePoints, updateStreak, computeLevel, checkNewBadges, BADGES } from '@/lib/gamification';
import BottomNav, { Tab } from '@/components/BottomNav';
import FeedView from '@/components/FeedView';
import ExploreView from '@/components/ExploreView';
import AddExperienceForm from '@/components/AddExperienceForm';
import ProfileView from '@/components/ProfileView';
import NewBadgeToast from '@/components/NewBadgeToast';
import AuthModal from '@/components/AuthModal';
import { Sparkles, LogOut, Crown } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [prefilledExperienceId, setPrefilledExperienceId] = useState<string | null>(null);
  const [surprise, setSurprise] = useState<Experience | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>(curatedExperiences);
  const [liveMeta, setLiveMeta] = useState<{ liveCount: number; apis: Record<string, boolean> } | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    setMounted(true);
    setProfile(loadProfile());
    setFilters(loadFilters());

    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather?lat=40.4168&lng=-3.7038');
        if (!res.ok) return;
        const data = await res.json();
        setWeather(data);
      } catch {
        setWeather(null);
      }
    };
    fetchWeather();
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
        const res = await fetch(
          `/api/experiences?types=${encodeURIComponent(types)}&dateWindow=${encodeURIComponent(filters.dateWindow)}`
        );
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
      if (exp.distanceKm > filters.maxDistance) return false;
      if (filters.vibe !== 'any' && exp.vibe !== filters.vibe) return false;
      if (filters.dareLevel !== 'any' && exp.dareLevel !== filters.dareLevel) return false;
      return true;
    });
  }, [filters, experiences]);

  const allProfiles = useMemo(() => (profile ? loadAllProfiles(profile) : []), [profile]);
  const friendProfiles = useMemo(() => allProfiles.filter((p) => p.email !== (profile?.email || 'me')), [allProfiles, profile]);

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
    logExperienceInternal(surprise.id, 0, '', undefined, []);
    setSurprise(null);
  };

  const logExperienceInternal = (
    experienceId: string,
    rating: number,
    caption: string,
    photoUrl: string | undefined,
    sharedWith: string[]
  ) => {
    if (!profile) return;
    const experience = experiences.find((e) => e.id === experienceId);
    if (!experience) return;

    const streak = updateStreak(profile);
    const pointsEarned = calculatePoints(experience, streak);
    const completedAt = new Date().toISOString();

    const nextCompleted = [
      ...profile.completed,
      {
        id: experience.id,
        completedAt,
        rating,
        dareLevel: experience.dareLevel,
        type: experience.type,
        budget: experience.budget,
        vibe: experience.vibe,
        caption,
        photoUrl,
        sharedWith,
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
  };

  const handleLogExperience = (
    experienceId: string,
    rating: number,
    caption: string,
    photoUrl: string | undefined,
    sharedWith: string[]
  ) => {
    logExperienceInternal(experienceId, rating, caption, photoUrl, sharedWith);
    setPrefilledExperienceId(null);
    setActiveTab('feed');
  };

  const handleLogFromSurprise = (experience: Experience) => {
    setPrefilledExperienceId(experience.id);
    setActiveTab('add');
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
    const fresh = getDefaultProfile();
    setProfile(fresh);
    setSurprise(null);
    setActiveTab('feed');
    saveProfile(fresh);
  };

  const handleAddFriend = (email: string) => {
    if (!profile || email === profile.email) return;
    if (profile.friends.includes(email)) return;
    const next = { ...profile, friends: [...profile.friends, email] };
    setProfile(next);
  };

  const handleRemoveFriend = (email: string) => {
    if (!profile) return;
    const next = { ...profile, friends: profile.friends.filter((e) => e !== email) };
    setProfile(next);
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
    <main className="min-h-screen bg-freak-bg md:ml-20 pb-20 md:pb-0">
      <BottomNav active={activeTab} onChange={setActiveTab} />

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
            <div className="text-sm font-black text-freak-yellow neon-text-yellow">{profile.points} PTS</div>
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

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <FeedView profiles={allProfiles} experiences={experiences} currentUserEmail={profile.email} />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            filters={filters}
            onFiltersChange={setFilters}
            experiences={experiences}
            surprise={surprise}
            isGenerating={isGenerating}
            hasMatches={filteredExperiences.length > 0}
            liveMeta={liveMeta}
            loadingLive={loadingLive}
            weather={weather}
            onGenerate={generateSurprise}
            onAccept={acceptDare}
            onSkip={skipDare}
            onLogExperience={handleLogFromSurprise}
          />
        )}

        {activeTab === 'add' && (
          <AddExperienceForm
            experiences={experiences}
            prefilledExperienceId={prefilledExperienceId}
            friends={friendProfiles}
            onLog={handleLogExperience}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            experiences={experiences}
            friendProfiles={friendProfiles}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
          />
        )}
      </div>

      {badge && <NewBadgeToast badge={badge} onClose={dismissBadge} />}

      {!isLoggedIn && <AuthModal onLogin={handleLogin} />}
    </main>
  );
}
