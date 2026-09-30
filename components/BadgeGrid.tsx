'use client';

import { UserProfile } from '@/lib/types';
import { BADGES } from '@/lib/gamification';
import { Award, Lock } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function BadgeGrid({ profile }: Props) {
  const earnedIds = new Set(profile.badges);

  return (
    <div className="comic-panel p-5">
      <h3 className="comic-text text-xl mb-4 flex items-center gap-2 gradient-text-purple">
        <Award className="w-5 h-5 text-freak-purple" />
        Achievement Badges
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative rounded-xl p-3 border-2 transition-all overflow-hidden ${
                earned
                  ? 'bg-gradient-to-br from-freak-pink/15 to-freak-purple/10 border-freak-pink shadow-neon-pink'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              {earned && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-freak-yellow starburst flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-freak-bg" />
                </div>
              )}
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className={`font-black text-sm uppercase tracking-wide ${earned ? 'text-white' : 'text-white/60'}`}>
                {badge.name}
              </div>
              <div className="text-[10px] text-white/50 leading-tight">{badge.description}</div>
              {!earned && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-white/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
