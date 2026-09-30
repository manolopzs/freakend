'use client';

import { Experience, UserProfile } from '@/lib/types';
import { budgetLabels, dareLabels } from '@/data/experiences';
import { Calendar, MapPin } from 'lucide-react';

interface Props {
  profile: UserProfile;
  experiences: Experience[];
}

export default function CompletedList({ profile, experiences }: Props) {
  if (profile.completed.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold mb-2">Your dares</h3>
        <p className="text-gray-500 text-sm">No dares yet. Time to get out of your comfort zone.</p>
      </div>
    );
  }

  const expMap = new Map(experiences.map((e) => [e.id, e]));
  const ordered = [...profile.completed].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-semibold mb-4">Your dares</h3>
      <div className="space-y-3">
        {ordered.map((c) => {
          const exp = expMap.get(c.id);
          if (!exp) return null;
          return (
            <div key={c.id + c.completedAt} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              {exp.photoUrl ? (
                <img src={exp.photoUrl} alt={exp.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="text-3xl shrink-0">{exp.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{exp.title}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" /> {exp.neighborhood}
                  <span className="text-gray-300">·</span>
                  {budgetLabels[exp.budget]}
                  <span className="text-gray-300">·</span>
                  {dareLabels[exp.dareLevel]}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(c.completedAt).toLocaleDateString()}
                  <span className="ml-2 text-ie-red font-medium">+{20 + exp.dareLevel * 10 + exp.budget * 5} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
