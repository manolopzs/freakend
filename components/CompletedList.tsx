'use client';

import { Experience, UserProfile } from '@/lib/types';
import { budgetLabels, dareLabels } from '@/data/experiences';
import { Calendar, MapPin, Trophy } from 'lucide-react';

interface Props {
  profile: UserProfile;
  experiences: Experience[];
}

export default function CompletedList({ profile, experiences }: Props) {
  if (profile.completed.length === 0) {
    return (
      <div className="comic-panel p-5">
        <h3 className="comic-text text-xl mb-2 gradient-text-yellow">Your dares</h3>
        <p className="text-white/60 text-sm">No dares yet. Time to get out of your comfort zone.</p>
      </div>
    );
  }

  const expMap = new Map(experiences.map((e) => [e.id, e]));
  const ordered = [...profile.completed].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <div className="comic-panel p-5">
      <h3 className="comic-text text-xl mb-4 flex items-center gap-2 gradient-text-yellow">
        <Trophy className="w-5 h-5 text-freak-yellow" />
        Your dares
      </h3>
      <div className="space-y-3">
        {ordered.map((c, index) => {
          const exp = expMap.get(c.id);
          if (!exp) return null;
          const basePoints = 20 + exp.dareLevel * 10 + exp.budget * 5;
          return (
            <div key={`${c.id}-${c.completedAt}-${index}`} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-freak-cyan/40 transition-colors">
              {exp.photoUrl ? (
                <img src={exp.photoUrl} alt={exp.title} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-freak-pink/10 border border-freak-pink/30 flex items-center justify-center text-2xl shrink-0">
                  {exp.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-white line-clamp-2 uppercase tracking-wide break-words">{exp.title}</div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50 mt-1">
                  <span className="truncate max-w-[50%] flex items-center gap-1"><MapPin className="w-3 h-3 text-freak-cyan shrink-0" /> {exp.neighborhood}</span>
                  <span className="text-freak-yellow">{budgetLabels[exp.budget]}</span>
                  <span className="text-freak-purple">{dareLabels[exp.dareLevel]}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(c.completedAt).toLocaleDateString()}
                  <span
                    className="ml-2 text-freak-pink font-black uppercase"
                    title="Base points only; actual total may include a streak bonus"
                  >
                    +{basePoints} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
