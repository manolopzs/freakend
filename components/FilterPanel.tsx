'use client';

import { Filters, ExperienceType, Budget, DareLevel, Vibe } from '@/lib/types';
import { budgetLabels, vibeLabels } from '@/data/experiences';
import { MapPin, Wallet, Zap, Users, SlidersHorizontal } from 'lucide-react';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const ALL_TYPES: ExperienceType[] = ['food', 'nightlife', 'culture', 'adventure', 'wellness'];

const COMIC_TYPE_LABELS: Record<ExperienceType, string> = {
  food: 'RESTAURANTS',
  nightlife: 'NIGHTLIFE',
  culture: 'CULTURE',
  adventure: 'SPORTS',
  wellness: 'WELLNESS',
};

const COMIC_TYPE_EMOJI: Record<ExperienceType, string> = {
  food: '🍔',
  nightlife: '🎉',
  culture: '🎭',
  adventure: '⚽',
  wellness: '🧘',
};

const COMIC_TYPE_GRADIENT: Record<ExperienceType, string> = {
  food: 'from-freak-orange to-freak-yellow',
  nightlife: 'from-freak-pink to-freak-purple',
  culture: 'from-freak-cyan to-freak-purple',
  adventure: 'from-freak-green to-freak-cyan',
  wellness: 'from-freak-purple to-freak-pink',
};

export default function FilterPanel({ filters, onChange }: Props) {
  const toggleType = (type: ExperienceType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  };

  const darePercent = filters.dareLevel === 'any' ? 50 : ((filters.dareLevel as number) / 5) * 100;
  const budgetPercent = (filters.budget / 4) * 100;
  const distancePercent = filters.maxDistance === 100 ? 100 : (filters.maxDistance / 100) * 100;

  return (
    <div className="comic-panel p-5">
      <h3 className="comic-text text-xl mb-5 flex items-center gap-2 gradient-text">
        <SlidersHorizontal className="w-5 h-5 text-freak-cyan" />
        Customize your freakend
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-3 block">
            Pick your vibe
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_TYPES.map((type) => {
              const active = filters.types.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`category-tile relative rounded-xl p-3 text-left border-2 transition-all ${
                    active
                      ? 'border-freak-pink bg-freak-pink/10 active'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-10 h-10 bg-gradient-to-br ${COMIC_TYPE_GRADIENT[type]} opacity-20 blur-lg rounded-full`} />
                  <div className="relative z-10">
                    <div className="text-xl mb-1">{COMIC_TYPE_EMOJI[type]}</div>
                    <div className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-freak-pink' : 'text-white/80'}`}>
                      {COMIC_TYPE_LABELS[type]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-freak-pink" />
              How freaky?
            </label>
            <span className="text-xs font-black text-freak-pink uppercase">
              {filters.dareLevel === 'any' ? 'Any' : filters.dareLevel === 1 ? 'Chill' : filters.dareLevel === 5 ? 'Wild' : `Level ${filters.dareLevel}`}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={filters.dareLevel === 'any' ? 3 : filters.dareLevel}
              onChange={(e) => onChange({ ...filters, dareLevel: Number(e.target.value) as DareLevel })}
              className="comic-slider slider-pink"
              style={{ background: `linear-gradient(90deg, #2de2e6 ${darePercent}%, rgba(255,255,255,0.08) ${darePercent}%)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase mt-1">
            <span>Chill</span>
            <span>Wild</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-freak-yellow" />
              Budget
            </label>
            <span className="text-xs font-black text-freak-yellow uppercase">
              {budgetLabels[filters.budget]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={filters.budget}
            onChange={(e) => onChange({ ...filters, budget: Number(e.target.value) as Budget })}
            className="comic-slider slider-yellow"
            style={{ background: `linear-gradient(90deg, #fff200 ${budgetPercent}%, rgba(255,255,255,0.08) ${budgetPercent}%)` }}
          />
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase mt-1">
            <span>$</span>
            <span>$$$$</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-freak-purple" />
              Comfort-zone level
            </label>
            <span className="text-xs font-black text-freak-purple uppercase">
              {filters.maxDistance === 100 ? 'Anywhere' : `${filters.maxDistance} km`}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={filters.maxDistance}
            onChange={(e) => onChange({ ...filters, maxDistance: Number(e.target.value) })}
            className="comic-slider slider-purple"
            style={{ background: `linear-gradient(90deg, #7b2dff ${distancePercent}%, rgba(255,255,255,0.08) ${distancePercent}%)` }}
          />
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase mt-1">
            <span>Safe</span>
            <span>Out of my comfort zone</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-freak-cyan" />
            Vibe
          </label>
          <div className="flex gap-2">
            {(['any', 'solo', 'date', 'group'] as const).map((vibe) => (
              <button
                key={vibe}
                onClick={() => onChange({ ...filters, vibe })}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                  filters.vibe === vibe
                    ? 'bg-freak-cyan text-freak-bg border-freak-cyan shadow-neon-cyan'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                }`}
              >
                {vibeLabels[vibe]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
