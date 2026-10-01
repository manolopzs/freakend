'use client';

import { UserProfile } from '@/lib/types';
import { computeProgressToNext } from '@/lib/gamification';
import { Flame, Trophy, Star, Zap, Crown } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: Props) {
  const { current, next, progressPercent } = computeProgressToNext(profile.points);

  return (
    <div className="comic-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-freak-pink/20 to-freak-cyan/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-freak-purple/20 to-freak-yellow/10 blur-2xl rounded-full" />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="comic-text text-2xl sm:text-3xl text-white truncate">{profile.name}</h2>
            <p className="text-freak-cyan text-xs font-black uppercase tracking-wider truncate">
              {profile.cohort} · {current.name} · Level {current.level}
            </p>
          </div>
          <div className="bg-freak-yellow/10 border-2 border-freak-yellow rounded-full p-3 shadow-neon-yellow">
            <Crown className="w-7 h-7 text-freak-yellow" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-freak-yellow" />
            <div className="text-xl font-black text-white">{profile.points}</div>
            <div className="text-[10px] font-black text-white/50 uppercase">Points</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-freak-orange" />
            <div className="text-xl font-black text-white">{profile.streak}</div>
            <div className="text-[10px] font-black text-white/50 uppercase">Day Streak</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-freak-cyan" />
            <div className="text-xl font-black text-white">{profile.completed.length}</div>
            <div className="text-[10px] font-black text-white/50 uppercase">Dares</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
            <span className="text-white/70">Level {current.level}</span>
            {next && <span className="text-freak-pink">Level {next.level}</span>}
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-freak-pink via-freak-purple to-freak-cyan transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {next && (
            <p className="text-[10px] font-black text-white/50 uppercase mt-1">
              {next.minPoints - profile.points} points to {next.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
