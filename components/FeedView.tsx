'use client';

import { useMemo } from 'react';
import { Experience, FriendProfile, CompletedExperience } from '@/lib/types';
import { Star } from 'lucide-react';

interface FeedItem {
  profile: FriendProfile;
  completed: CompletedExperience;
}

interface Props {
  profiles: FriendProfile[];
  experiences: Experience[];
  currentUserEmail?: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedView({ profiles, experiences, currentUserEmail }: Props) {
  const expMap = useMemo(() => new Map(experiences.map((e) => [e.id, e])), [experiences]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    profiles.forEach((profile) => {
      profile.completed.forEach((completed) => {
        const isMe = profile.email === (currentUserEmail || 'me');
        if (!isMe && completed.sharedWith && completed.sharedWith.length > 0 && currentUserEmail) {
          if (!completed.sharedWith.includes(currentUserEmail)) return;
        }
        items.push({ profile, completed });
      });
    });
    return items.sort((a, b) => new Date(b.completed.completedAt).getTime() - new Date(a.completed.completedAt).getTime());
  }, [profiles, currentUserEmail]);

  if (feedItems.length === 0) {
    return (
      <div className="comic-panel p-6 text-center">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="comic-text text-xl mb-2 gradient-text">Your feed is quiet</h3>
        <p className="text-white/60 text-sm">Log an experience or add friends to see their stories here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedItems.map((item, index) => {
        const exp = expMap.get(item.completed.id);
        const isMe = item.profile.email === (currentUserEmail || 'me');
        const imageUrl = item.completed.photoUrl || exp?.photoUrl || null;
        return (
          <article key={`${item.profile.email}-${item.completed.id}-${index}`} className="comic-panel overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-freak-cyan to-freak-purple flex items-center justify-center text-xl shadow-neon-cyan">
                {item.profile.avatarEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-white truncate">
                  {item.profile.name} {isMe && <span className="text-freak-pink">(you)</span>}
                </div>
                <div className="text-[10px] text-white/50 font-bold uppercase">
                  {item.profile.cohort} · {timeAgo(item.completed.completedAt)}
                </div>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative h-56 sm:h-72 bg-black">
                <img src={imageUrl} alt={exp?.title || 'Experience'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-freak-bg/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="comic-text text-xl sm:text-2xl text-white drop-shadow-lg">{exp?.title}</h3>
                  <p className="text-freak-cyan text-xs font-black uppercase tracking-wider">{exp?.neighborhood}</p>
                </div>
              </div>
            ) : (
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center">
                <div className="absolute inset-0 halftone-bg opacity-30" />
                <div className="text-center z-10">
                  <div className="text-5xl mb-2 animate-float">{exp?.emoji}</div>
                  <h3 className="comic-text text-xl text-white">{exp?.title}</h3>
                  <p className="text-freak-cyan text-xs font-black uppercase tracking-wider">{exp?.neighborhood}</p>
                </div>
              </div>
            )}

            <div className="p-4">
              {item.completed.rating > 0 && (
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= item.completed.rating ? 'text-freak-yellow fill-freak-yellow' : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
              {item.completed.caption && (
                <p className="text-white/90 text-sm leading-relaxed mb-3">{item.completed.caption}</p>
              )}
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-white/50">
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{exp?.type}</span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{exp?.vibe}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
