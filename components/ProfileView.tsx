'use client';

import { useState } from 'react';
import { UserProfile, Experience, FriendProfile, Plan } from '@/lib/types';
import ProfileHeader from '@/components/ProfileHeader';
import BadgeGrid from '@/components/BadgeGrid';
import Leaderboard from '@/components/Leaderboard';
import ExperienceCard from '@/components/ExperienceCard';
import PlansView from '@/components/PlansView';
import { UserPlus, X, Star, Calendar, MapPin, Bookmark, CalendarDays, List } from 'lucide-react';

type ProfileTab = 'activity' | 'saved' | 'plans';

interface Props {
  profile: UserProfile;
  experiences: Experience[];
  curatedExperiences?: Experience[];
  friendProfiles: FriendProfile[];
  onAddFriend: (email: string) => void;
  onRemoveFriend: (email: string) => void;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
  onLogExperience?: (experience: Experience) => void;
  onLeavePlan?: (plan: Plan) => void;
}

export default function ProfileView({
  profile,
  experiences,
  curatedExperiences = [],
  friendProfiles,
  onAddFriend,
  onRemoveFriend,
  onToggleSave,
  onWantToGo,
  onLogExperience,
  onLeavePlan,
}: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
  const allExperiences = [...experiences, ...curatedExperiences];
  const expMap = new Map(allExperiences.map((e) => [e.id, e]));
  const ordered = [...profile.completed].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  const savedExperiences = profile.saved.map((id) => expMap.get(id)).filter(Boolean) as Experience[];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (email === profile.email) return;
    onAddFriend(email);
    setNewEmail('');
  };

  const tabs: { id: ProfileTab; label: string; icon: typeof List }[] = [
    { id: 'activity', label: 'Activity', icon: List },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'plans', label: 'Plans', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />

      <div className="comic-panel p-5">
        <h3 className="comic-text text-xl mb-4 flex items-center gap-2 gradient-text">
          <UserPlus className="w-5 h-5 text-freak-cyan" />
          Friends
        </h3>

        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="friend@student.ie.edu"
            className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-cyan focus:ring-2 focus:ring-freak-cyan/30 outline-none text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-freak-cyan text-freak-bg font-black uppercase text-xs tracking-wider hover:bg-freak-cyan-glow transition-colors"
          >
            Add
          </button>
        </form>

        {profile.friends.length === 0 ? (
          <p className="text-sm text-white/50">No friends yet. Add some to see their stories in your feed.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.friends.map((email) => {
              const friend = friendProfiles.find((f) => f.email === email);
              return (
                <div
                  key={email}
                  className="flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider min-w-0 max-w-full"
                >
                  <span className="text-base shrink-0">{friend?.avatarEmoji || '👤'}</span>
                  <span className="text-white/90 truncate">{friend?.name || email}</span>
                  <button
                    onClick={() => onRemoveFriend(email)}
                    className="ml-1 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-freak-pink transition-colors shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Leaderboard profile={profile} />
      <BadgeGrid profile={profile} />

      <div className="comic-panel p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  active
                    ? 'bg-freak-pink/20 border-freak-pink text-white shadow-neon-pink'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'saved' && profile.saved.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-freak-yellow text-freak-bg text-[9px]">
                    {profile.saved.length}
                  </span>
                )}
                {tab.id === 'plans' && profile.plans.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-freak-cyan text-freak-bg text-[9px]">
                    {profile.plans.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'activity' && (
          <>
            <h3 className="comic-text text-xl mb-4 gradient-text-yellow flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Your logged experiences
            </h3>
            {ordered.length === 0 ? (
              <p className="text-sm text-white/50">Nothing logged yet. Go explore and post your first Freakend.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ordered.map((c, index) => {
                  const exp = expMap.get(c.id);
                  if (!exp) return null;
                  const imageUrl = c.photoUrl || exp.photoUrl || null;
                  return (
                    <div key={`${c.id}-${c.completedAt}-${index}`} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-freak-cyan/40 transition-colors">
                      {imageUrl ? (
                        <div className="h-32 bg-black">
                          <img src={imageUrl} alt={exp.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center">
                          <div className="text-4xl">{exp.emoji}</div>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="font-black text-sm text-white line-clamp-2 uppercase tracking-wide break-words">{exp.title}</div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/50 mt-1">
                          <span className="truncate max-w-[50%] flex items-center gap-1"><MapPin className="w-3 h-3 text-freak-cyan shrink-0" /> {exp.neighborhood}</span>
                          <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3" /> {new Date(c.completedAt).toLocaleDateString()}</span>
                        </div>
                        {c.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= c.rating ? 'text-freak-yellow fill-freak-yellow' : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {c.caption && <p className="text-xs text-white/70 mt-2 line-clamp-2">“{c.caption}”</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            <h3 className="comic-text text-xl mb-4 gradient-text flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Saved wishlist
            </h3>
            {savedExperiences.length === 0 ? (
              <p className="text-sm text-white/50">No saved experiences yet. Bookmark ones you want to try later.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedExperiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    isSaved
                    onToggleSave={onToggleSave}
                    onWantToGo={onWantToGo}
                    onLogExperience={onLogExperience}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'plans' && (
          <PlansView
            profile={profile}
            experiences={allExperiences}
            friendProfiles={friendProfiles}
            onWantToGo={onWantToGo}
            onLogExperience={onLogExperience}
            onLeavePlan={onLeavePlan}
          />
        )}
      </div>
    </div>
  );
}
