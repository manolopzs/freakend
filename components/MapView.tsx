'use client';

import { useMemo, useState } from 'react';
import { Experience, UserProfile } from '@/lib/types';
import { MapPin, Navigation, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Props {
  experiences: Experience[];
  curatedExperiences?: Experience[];
  currentProfile: UserProfile;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
}

export default function MapView({ experiences, curatedExperiences = [], currentProfile, onToggleSave, onWantToGo }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const zones = useMemo(() => {
    const allExperiences = [...experiences, ...curatedExperiences];
    const map = new Map<string, Experience[]>();
    allExperiences.forEach((exp) => {
      const list = map.get(exp.neighborhood) || [];
      list.push(exp);
      map.set(exp.neighborhood, list);
    });
    return Array.from(map.entries())
      .map(([neighborhood, items]) => ({
        neighborhood,
        items: items.sort((a, b) => a.distanceKm - b.distanceKm),
        pin: items[0]?.emoji || '📍',
        avgDistance: items.reduce((sum, i) => sum + i.distanceKm, 0) / items.length,
      }))
      .sort((a, b) => a.avgDistance - b.avgDistance);
  }, [experiences]);

  const toggle = (neighborhood: string) => {
    setExpanded((prev) => ({ ...prev, [neighborhood]: !prev[neighborhood] }));
  };

  if (zones.length === 0) {
    return (
      <div className="comic-panel p-6 text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <h3 className="comic-text text-xl mb-2 gradient-text">Map is empty</h3>
        <p className="text-white/60 text-sm">No experiences available to map right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="comic-panel p-5">
        <h2 className="comic-text text-2xl gradient-text flex items-center gap-2">
          <MapPin className="w-6 h-6 text-freak-pink" /> Map Discovery
        </h2>
        <p className="text-white/60 text-sm mt-1">
          Explore Madrid by neighborhood zones — no API key required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const isOpen = !!expanded[zone.neighborhood];
          const savedCount = zone.items.filter((i) => currentProfile.saved.includes(i.id)).length;
          return (
            <div
              key={zone.neighborhood}
              className="comic-card overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(zone.neighborhood)}
                className="w-full p-4 text-left relative overflow-hidden group"
              >
                <div className="absolute inset-0 halftone-bg opacity-20" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-freak-panel border-2 border-freak-cyan flex items-center justify-center text-2xl shadow-neon-cyan">
                      {zone.pin}
                    </div>
                    <div className="min-w-0">
                      <h3 className="comic-text text-base sm:text-lg text-white truncate">{zone.neighborhood}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/50">
                        <Navigation className="w-3 h-3 text-freak-cyan shrink-0" />
                        <span className="truncate">{zone.avgDistance.toFixed(1)} km avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-1 rounded-full bg-freak-pink/10 border border-freak-pink/40 text-freak-pink text-xs font-black">
                      {zone.items.length} spots
                    </span>
                    {savedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-freak-yellow/10 border border-freak-yellow/40 text-freak-yellow text-[9px] font-black">
                        {savedCount} saved
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-white/50 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/50 mt-1" />
                    )}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 p-3 space-y-2">
                  {zone.items.map((exp) => {
                    const isSaved = currentProfile.saved.includes(exp.id);
                    return (
                      <div
                        key={exp.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-freak-cyan/40 transition-colors"
                      >
                        <div className="text-2xl">{exp.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-sm text-white line-clamp-2 break-words">{exp.title}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/50 font-black uppercase tracking-wider">
                            <span className="truncate max-w-[45%]">{exp.type}</span>
                            <span>{exp.distanceKm} km</span>
                            <span>{'€'.repeat(exp.budget)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {onToggleSave && (
                            <button
                              onClick={() => onToggleSave(exp)}
                              className={`p-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                                isSaved
                                  ? 'bg-freak-yellow border-freak-yellow text-freak-bg'
                                  : 'bg-white/5 border-white/20 text-white/70 hover:text-freak-yellow hover:border-freak-yellow'
                              }`}
                            >
                              {isSaved ? 'Saved' : 'Save'}
                            </button>
                          )}
                          {onWantToGo && (
                            <button
                              onClick={() => onWantToGo(exp)}
                              className="p-1.5 rounded-lg bg-freak-cyan/10 border border-freak-cyan/40 text-freak-cyan text-[10px] font-black uppercase hover:bg-freak-cyan/20 transition-colors"
                            >
                              Plan
                            </button>
                          )}
                          {exp.mapUrl && (
                            <a
                              href={exp.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 border border-white/20 text-white/70 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
