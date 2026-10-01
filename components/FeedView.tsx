'use client';

import { useMemo, useState } from 'react';
import { Experience, FriendProfile, CompletedExperience, Comment } from '@/lib/types';
import { Star, MessageCircle, Send } from 'lucide-react';

interface FeedItem {
  profile: FriendProfile;
  completed: CompletedExperience;
}

interface Props {
  profiles: FriendProfile[];
  experiences: Experience[];
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onToggleReaction?: (completed: CompletedExperience, emoji: string) => void;
  onAddComment?: (completed: CompletedExperience, text: string) => void;
}

const REACTIONS = ['🔥', '❤️', '👏', '😂'];

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

function ratingStars(value?: number) {
  if (!value || value < 1) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= value ? 'text-freak-yellow fill-freak-yellow' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function FeedView({
  profiles,
  experiences,
  currentUserEmail,
  currentUserName,
  currentUserAvatar,
  onToggleReaction,
  onAddComment,
}: Props) {
  const expMap = useMemo(() => new Map(experiences.map((e) => [e.id, e])), [experiences]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

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
        const reactions = item.completed.reactions || {};
        const comments = item.completed.comments || [];
        const postKey = `${item.profile.email}-${item.completed.id}-${index}`;

        return (
          <article key={postKey} className="comic-panel overflow-hidden">
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
                <div className="absolute bottom-3 left-4 right-4 max-w-full min-w-0">
                  <h3 className="comic-text text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg line-clamp-2 break-words">{exp?.title}</h3>
                  <p className="text-freak-cyan text-xs font-black uppercase tracking-wider truncate">{exp?.neighborhood}</p>
                </div>
              </div>
            ) : (
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center">
                <div className="absolute inset-0 halftone-bg opacity-30" />
                <div className="text-center z-10 px-4 w-full max-w-full min-w-0">
                  <div className="text-5xl mb-2 animate-float">{exp?.emoji}</div>
                  <h3 className="comic-text text-lg sm:text-xl text-white line-clamp-2 break-words">{exp?.title}</h3>
                  <p className="text-freak-cyan text-xs font-black uppercase tracking-wider truncate">{exp?.neighborhood}</p>
                </div>
              </div>
            )}

            <div className="p-4">
              {item.completed.rating > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  {ratingStars(item.completed.rating)}
                  {item.completed.vibeRating ? ratingStars(item.completed.vibeRating) : null}
                  {item.completed.valueRating ? ratingStars(item.completed.valueRating) : null}
                  {item.completed.uniquenessRating ? ratingStars(item.completed.uniquenessRating) : null}
                </div>
              )}

              {(item.completed.tags && item.completed.tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.completed.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-freak-purple/10 border border-freak-purple/40 text-freak-purple text-[10px] font-black uppercase tracking-wider truncate max-w-[120px]"
                    >
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {item.completed.caption && (
                <p className="text-white/90 text-sm leading-relaxed mb-3">{item.completed.caption}</p>
              )}

              {item.completed.notes && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                  <p className="text-white/70 text-xs leading-relaxed italic">“{item.completed.notes}”</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-white/50 mb-3">
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 truncate max-w-[45%]">{exp?.type}</span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 truncate max-w-[45%]">{exp?.vibe}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                {REACTIONS.map((emoji) => {
                  const users = reactions[emoji] || [];
                  const hasReacted = currentUserEmail ? users.includes(currentUserEmail) : false;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onToggleReaction?.(item.completed, emoji)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-black border transition-all ${
                        hasReacted
                          ? 'bg-freak-pink/20 border-freak-pink text-white shadow-neon-pink'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <span>{emoji}</span>
                      {users.length > 0 && <span>{users.length}</span>}
                    </button>
                  );
                })}
                <div className="flex items-center gap-1 text-xs text-white/50 ml-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {comments.length}
                </div>
              </div>

              {comments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-freak-cyan to-freak-purple flex items-center justify-center text-xs shrink-0">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 bg-white/5 rounded-r-xl rounded-bl-xl px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-freak-cyan">{comment.authorName}</span>
                          <span className="text-[10px] text-white/40">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-white/80 text-xs leading-relaxed mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentUserEmail && onAddComment && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = commentDrafts[postKey]?.trim();
                    if (!text) return;
                    onAddComment(item.completed, text);
                    setCommentDrafts((prev) => ({ ...prev, [postKey]: '' }));
                  }}
                  className="mt-3 flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                    {currentUserAvatar || currentUserName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <input
                    type="text"
                    value={commentDrafts[postKey] || ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [postKey]: e.target.value }))}
                    placeholder="Add a comment…"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-white/30 focus:border-freak-cyan focus:ring-2 focus:ring-freak-cyan/30 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!commentDrafts[postKey]?.trim()}
                    className="p-2 rounded-xl bg-freak-cyan text-freak-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
