'use client';

import { UserProfile, Experience, FriendProfile, Plan } from '@/lib/types';
import { CalendarDays, MapPin, PenLine, LogOut, Users } from 'lucide-react';

interface Props {
  profile: UserProfile;
  experiences: Experience[];
  friendProfiles: FriendProfile[];
  onWantToGo?: (experience: Experience) => void;
  onLogExperience?: (experience: Experience) => void;
  onLeavePlan?: (plan: Plan) => void;
}

export default function PlansView({
  profile,
  experiences,
  friendProfiles,
  onWantToGo,
  onLogExperience,
  onLeavePlan,
}: Props) {
  const expMap = new Map(experiences.map((e) => [e.id, e]));
  const ordered = [...profile.plans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 className="comic-text text-xl mb-4 gradient-text-cyan flex items-center gap-2">
        <CalendarDays className="w-4 h-4" /> Upcoming plans
      </h3>

      {ordered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🗓️</div>
          <p className="text-sm text-white/50">No plans yet. Hit “Want to go” on any experience to start planning with friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ordered.map((plan) => {
            const exp = expMap.get(plan.experienceId);
            if (!exp) return null;
            const attendees = plan.attendees
              .map((email) => friendProfiles.find((f) => f.email === email) || { email, name: email, avatarEmoji: '👤' })
              .concat(
                plan.attendees.includes(profile.email)
                  ? [{ email: profile.email, name: profile.name || 'You', avatarEmoji: profile.avatarEmoji || '🙂' }]
                  : []
              )
              .filter((v, i, a) => a.findIndex((t) => t.email === v.email) === i);

            return (
              <div
                key={plan.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-freak-cyan/40 transition-colors"
              >
                <div className="h-28 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center relative">
                  {exp.photoUrl ? (
                    <img src={exp.photoUrl} alt={exp.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-freak-bg/90 via-transparent to-transparent" />
                  <div className="relative z-10 text-center px-4 w-full max-w-full min-w-0">
                    <div className="text-3xl mb-1">{exp.emoji}</div>
                    <h4 className="comic-text text-sm sm:text-base text-white line-clamp-2 break-words">{exp.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-wider text-freak-cyan mb-2">
                    <span className="truncate max-w-[70%] flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /> {exp.neighborhood}</span>
                    <span>{exp.distanceKm} km</span>
                  </div>
                  <p className="text-white/70 text-xs line-clamp-2 mb-3">{exp.description}</p>

                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/50 mb-1.5">
                      <Users className="w-3 h-3" /> Going ({attendees.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attendees.map((a) => (
                        <span
                          key={a.email}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase min-w-0 max-w-full"
                        >
                          <span className="shrink-0">{a.avatarEmoji}</span>
                          <span className="text-white/80 truncate">{a.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onLogExperience && (
                      <button
                        onClick={() => onLogExperience(exp)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-freak-purple/20 hover:bg-freak-purple/40 border border-freak-purple/40 text-freak-purple text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <PenLine className="w-3 h-3" /> Log it
                      </button>
                    )}
                    {onLeavePlan && (
                      <button
                        onClick={() => onLeavePlan(plan)}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-freak-pink/20 border border-white/10 text-white/70 hover:text-freak-pink text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <LogOut className="w-3 h-3" /> Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
