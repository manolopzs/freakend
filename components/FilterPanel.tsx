'use client';

import { Filters, ExperienceType, Budget, DareLevel, Vibe } from '@/lib/types';
import { typeLabels, budgetLabels, dareLabels, vibeLabels } from '@/data/experiences';
import { MapPin, Wallet, Zap, Users, Tag } from 'lucide-react';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const ALL_TYPES: ExperienceType[] = ['food', 'nightlife', 'culture', 'adventure', 'wellness'];
const DARE_LEVELS: DareLevel[] = [1, 2, 3, 4, 5];

export default function FilterPanel({ filters, onChange }: Props) {
  const toggleType = (type: ExperienceType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-ie-red" />
        Set your dare preferences
      </h3>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Experience type</label>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.types.includes(type)
                    ? 'bg-ie-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Max budget: {budgetLabels[filters.budget]}
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={filters.budget}
            onChange={(e) => onChange({ ...filters, budget: Number(e.target.value) as Budget })}
            className="w-full accent-ie-red"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>€</span>
            <span>€€€€</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Max distance: {filters.maxDistance === 100 ? 'Any' : `${filters.maxDistance} km`}
          </label>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={filters.maxDistance}
            onChange={(e) => onChange({ ...filters, maxDistance: Number(e.target.value) })}
            className="w-full accent-ie-red"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Vibe
          </label>
          <div className="flex gap-2">
            {(['any', 'solo', 'date', 'group'] as const).map((vibe) => (
              <button
                key={vibe}
                onClick={() => onChange({ ...filters, vibe })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.vibe === vibe
                    ? 'bg-ie-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {vibeLabels[vibe]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Dare level
          </label>
          <div className="flex gap-2">
            {(['any', ...DARE_LEVELS] as const).map((level) => (
              <button
                key={level}
                onClick={() => onChange({ ...filters, dareLevel: level })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dareLevel === level
                    ? 'bg-ie-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 'any' ? 'Any' : dareLabels[level]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
