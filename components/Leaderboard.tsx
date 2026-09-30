'use client';

import { UserProfile, LeaderboardUser } from '@/lib/types';
import { Trophy, Medal, Crown, Zap } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const MOCK_CLASSMATES: LeaderboardUser[] = [
  { name: 'Sofia L.', cohort: 'MBA 2026', points: 420, level: 4, dares: 14 },
  { name: 'Marco R.', cohort: 'MBA 2026', points: 385, level: 4, dares: 12 },
  { name: 'Emma T.', cohort: 'MBA 2026', points: 310, level: 3, dares: 10 },
  { name: 'Lucas B.', cohort: 'MBA 2026', points: 275, level: 3, dares: 9 },
  { name: 'Priya K.', cohort: 'MBA 2026', points: 240, level: 3, dares: 8 },
  { name: 'Tom H.', cohort: 'MBA 2026', points: 195, level: 2, dares: 6 },
  { name: 'Ines M.', cohort: 'MBA 2026', points: 160, level: 2, dares: 5 },
  { name: 'David W.', cohort: 'MBA 2026', points: 120, level: 2, dares: 4 },
];

export default function Leaderboard({ profile }: Props) {
  const currentUser: LeaderboardUser = {
    name: profile.name,
    cohort: profile.cohort,
    points: profile.points,
    level: profile.level,
    dares: profile.completed.length,
    isCurrentUser: true,
  };

  const sameCohort = MOCK_CLASSMATES.filter((u) => u.cohort === profile.cohort);
  const allUsers = [...sameCohort, currentUser].sort((a, b) => b.points - a.points);

  return (
    <div className="comic-panel p-5">
      <h3 className="comic-text text-xl mb-4 flex items-center gap-2 gradient-text">
        <Trophy className="w-5 h-5 text-freak-yellow" />
        {profile.cohort} Leaderboard
      </h3>

      <div className="space-y-2">
        {allUsers.map((user, index) => (
          <div
            key={`${user.name}-${index}`}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              user.isCurrentUser
                ? 'bg-freak-pink/10 border-freak-pink shadow-neon-pink'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="w-8 text-center">
              {index === 0 ? (
                <Crown className="w-5 h-5 text-freak-yellow mx-auto" />
              ) : index === 1 ? (
                <Medal className="w-5 h-5 text-freak-cyan mx-auto" />
              ) : index === 2 ? (
                <Medal className="w-5 h-5 text-freak-purple mx-auto" />
              ) : (
                <span className="font-black text-white/40 text-sm">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-white truncate uppercase tracking-wide">
                {user.name} {user.isCurrentUser && <span className="text-freak-pink">(YOU)</span>}
              </div>
              <div className="text-[10px] text-white/50 font-bold uppercase">
                Level {user.level} · {user.dares} dares
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-sm text-freak-yellow">{user.points}</div>
              <div className="text-[10px] text-white/40 font-black uppercase">pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
