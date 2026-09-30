'use client';

import { UserProfile } from '@/lib/types';
import { computeProgressToNext } from '@/lib/gamification';
import { Flame, Trophy, Star, Zap } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: Props) {
  const { current, next, progressPercent } = computeProgressToNext(profile.points);

  return (
    <div className="bg-gradient-to-br from-ie-red to-red-800 text-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-red-100 text-sm">{profile.cohort} · {current.name} · Level {current.level}</p>
        </div>
        <div className="bg-white/20 rounded-full p-3">
          <Trophy className="w-8 h-8 text-ie-gold" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Star className="w-5 h-5 mx-auto mb-1 text-ie-gold" />
          <div className="text-xl font-bold">{profile.points}</div>
          <div className="text-xs text-red-100">Points</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
          <div className="text-xl font-bold">{profile.streak}</div>
          <div className="text-xs text-red-100">Day Streak</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
          <div className="text-xl font-bold">{profile.completed.length}</div>
          <div className="text-xs text-red-100">Dares</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Level {current.level}</span>
          {next && <span>Level {next.level}</span>}
        </div>
        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-ie-gold transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {next && (
          <p className="text-xs text-red-100 mt-1">
            {next.minPoints - profile.points} points to {next.name}
          </p>
        )}
      </div>
    </div>
  );
}
