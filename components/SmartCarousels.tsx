'use client';

import { useMemo, useRef } from 'react';
import { Experience, FriendProfile, UserProfile } from '@/lib/types';
import ExperienceCard from '@/components/ExperienceCard';
import { Moon, Sun, Flame, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  experiences: Experience[];
  profiles: FriendProfile[];
  currentProfile: UserProfile;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
  onLogExperience?: (experience: Experience) => void;
}

interface CarouselSectionProps {
  title: string;
  icon: React.ReactNode;
  experiences: Experience[];
  currentProfile: UserProfile;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
  onLogExperience?: (experience: Experience) => void;
  emptyText: string;
}

function CarouselSection({ title, icon, experiences, currentProfile, onToggleSave, onWantToGo, onLogExperience, emptyText }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="comic-text text-lg flex items-center gap-2 gradient-text">
          {icon} {title}
        </h4>
        {experiences.length > 0 && (
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {experiences.length === 0 ? (
        <p className="text-sm text-white/50">{emptyText}</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 px-1 -mx-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              isSaved={currentProfile.saved.includes(exp.id)}
              onToggleSave={onToggleSave}
              onWantToGo={onWantToGo}
              onLogExperience={onLogExperience}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SmartCarousels({
  experiences,
  profiles,
  currentProfile,
  onToggleSave,
  onWantToGo,
  onLogExperience,
}: Props) {
  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6 || day === 5;

  const logCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    profiles.forEach((p) => {
      p.completed.forEach((c) => {
        counts[c.id] = (counts[c.id] || 0) + 1;
      });
    });
    currentProfile.saved.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [profiles, currentProfile.saved]);

  const tonight = useMemo(() => {
    return experiences
      .filter((e) => {
        if (e.distanceKm > 10) return false;
        return ['food', 'nightlife', 'concerts', 'culture', 'adventure'].includes(e.type);
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);
  }, [experiences]);

  const thisWeekend = useMemo(() => {
    return experiences.filter((e) => {
      const typeOk = ['adventure', 'culture', 'sports', 'concerts', 'food'].includes(e.type);
      const distanceOk = e.distanceKm <= 10;
      return typeOk && distanceOk;
    });
  }, [experiences]);

  const trending = useMemo(() => {
    return [...experiences]
      .filter((e) => logCounts[e.id])
      .sort((a, b) => (logCounts[b.id] || 0) - (logCounts[a.id] || 0))
      .slice(0, 10);
  }, [experiences, logCounts]);

  return (
    <div className="comic-panel p-5 mb-6">
      <h3 className="comic-text text-xl mb-4 flex items-center gap-2 gradient-text">
        <TrendingUp className="w-5 h-5 text-freak-cyan" />
        Picks for you
      </h3>

      <CarouselSection
        title="Tonight"
        icon={<Moon className="w-4 h-4 text-freak-purple" />}
        experiences={tonight}
        currentProfile={currentProfile}
        onToggleSave={onToggleSave}
        onWantToGo={onWantToGo}
        onLogExperience={onLogExperience}
        emptyText="No tonight picks nearby. Try widening filters or checking weekend picks."
      />

      <CarouselSection
        title={isWeekend ? 'This Weekend' : 'This Weekend'}
        icon={<Sun className="w-4 h-4 text-freak-yellow" />}
        experiences={thisWeekend}
        currentProfile={currentProfile}
        onToggleSave={onToggleSave}
        onWantToGo={onWantToGo}
        onLogExperience={onLogExperience}
        emptyText="No weekend picks found. Adjust filters to explore more."
      />

      <CarouselSection
        title="Trending"
        icon={<Flame className="w-4 h-4 text-freak-pink" />}
        experiences={trending}
        currentProfile={currentProfile}
        onToggleSave={onToggleSave}
        onWantToGo={onWantToGo}
        onLogExperience={onLogExperience}
        emptyText="Nothing trending yet. Log and save experiences to make them trend."
      />
    </div>
  );
}
