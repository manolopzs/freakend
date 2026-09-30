'use client';

import { UserProfile } from '@/lib/types';
import { BADGES } from '@/lib/gamification';
import { Award } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function BadgeGrid({ profile }: Props) {
  const earnedIds = new Set(profile.badges);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-ie-red" />
        Badges
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-xl p-3 border transition-opacity ${
                earned
                  ? 'bg-ie-red/5 border-ie-red/20'
                  : 'bg-gray-50 border-gray-100 opacity-50'
              }`}
            >
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className="font-semibold text-sm">{badge.name}</div>
              <div className="text-xs text-gray-500">{badge.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
