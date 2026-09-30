'use client';

import { UserProfile, LeaderboardUser } from '@/lib/types';
import { Trophy, Medal, Crown } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-ie-red" />
        {profile.cohort} Leaderboard
      </h3>

      <div className="space-y-2">
        {allUsers.map((user, index) => (
          <div
            key={user.name}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              user.isCurrentUser ? 'bg-ie-red/10 border border-ie-red/20' : 'bg-gray-50'
            }`}
          >
            <div className="w-8 text-center font-bold text-gray-400">
              {index === 0 ? <Crown className="w-5 h-5 text-yellow-500 mx-auto" /> :
               index === 1 ? <Medal className="w-5 h-5 text-gray-400 mx-auto" /> :
               index === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
               index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {user.name} {user.isCurrentUser && <span className="text-ie-red">(You)</span>}
              </div>
              <div className="text-xs text-gray-500">
                Level {user.level} · {user.dares} dares
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{user.points}</div>
              <div className="text-xs text-gray-400">pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
