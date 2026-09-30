'use client';

import { Experience, Filters } from '@/lib/types';
import FilterPanel from '@/components/FilterPanel';
import SurpriseCard from '@/components/SurpriseCard';
import { Sparkles, Globe, Cloud } from 'lucide-react';

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  experiences: Experience[];
  surprise: Experience | null;
  isGenerating: boolean;
  hasMatches: boolean;
  liveMeta: { liveCount: number; apis: Record<string, boolean> } | null;
  loadingLive: boolean;
  weather?: { temp: number; condition: string; icon: string; location: string } | null;
  onGenerate: () => void;
  onAccept: () => void;
  onSkip: () => void;
  onLogExperience?: (experience: Experience) => void;
}

export default function ExploreView({
  filters,
  onFiltersChange,
  experiences,
  surprise,
  isGenerating,
  hasMatches,
  liveMeta,
  loadingLive,
  weather,
  onGenerate,
  onAccept,
  onSkip,
  onLogExperience,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="comic-text text-2xl gradient-text">Explore</h2>
        {liveMeta && liveMeta.liveCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-freak-cyan bg-freak-cyan/10 border border-freak-cyan/30 px-2.5 py-1 rounded-full">
            <Globe className="w-3 h-3" />
            {liveMeta.liveCount} LIVE
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          {weather && (
            <div className="comic-panel p-4 flex items-center gap-4">
              <div className="text-4xl">{weather.icon}</div>
              <div>
                <div className="text-2xl font-black text-white leading-none">{weather.temp}°C</div>
                <div className="text-xs font-black text-freak-cyan uppercase tracking-wider">{weather.condition}</div>
                <div className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> {weather.location}
                </div>
              </div>
            </div>
          )}
          <FilterPanel filters={filters} onChange={onFiltersChange} />
          {loadingLive && (
            <div className="text-xs font-bold text-freak-cyan flex items-center gap-2">
              <Sparkles className="w-3 h-3 animate-spin" /> SCANNING LIVE EVENTS…
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <SurpriseCard
            experience={surprise}
            isGenerating={isGenerating}
            hasMatches={hasMatches}
            onGenerate={onGenerate}
            onAccept={onAccept}
            onSkip={onSkip}
            onLogExperience={onLogExperience}
          />

          {hasMatches === false && (
            <div className="comic-panel border-l-4 border-l-freak-yellow p-4 text-sm text-white/90">
              <span className="font-black text-freak-yellow uppercase">No matches!</span>{' '}
              Loosen your filters to unlock a dare.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
