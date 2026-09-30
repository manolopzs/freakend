'use client';

import { useEffect, useState } from 'react';
import { Experience, FriendProfile } from '@/lib/types';
import { Star, Camera, Send, Users, Tag, FileText } from 'lucide-react';

interface Props {
  experiences: Experience[];
  prefilledExperienceId?: string | null;
  friends: FriendProfile[];
  onLog: (
    experienceId: string,
    rating: number,
    caption: string,
    photoUrl: string | undefined,
    sharedWith: string[],
    details: {
      vibeRating: number;
      valueRating: number;
      uniquenessRating: number;
      tags: string[];
      notes: string;
    }
  ) => void;
}

const PRESET_TAGS = [
  { value: 'hidden-gem', label: 'Hidden gem' },
  { value: 'great-for-dates', label: 'Great for dates' },
  { value: 'overrated', label: 'Overrated' },
  { value: 'ie-favorite', label: 'IE favorite' },
  { value: 'worth-the-hype', label: 'Worth the hype' },
  { value: 'skip-it', label: 'Skip it' },
];

export default function AddExperienceForm({ experiences, prefilledExperienceId, friends, onLog }: Props) {
  const [experienceId, setExperienceId] = useState(prefilledExperienceId || '');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [vibeRating, setVibeRating] = useState(0);
  const [hoverVibe, setHoverVibe] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [uniquenessRating, setUniquenessRating] = useState(0);
  const [hoverUniqueness, setHoverUniqueness] = useState(0);
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [sharedWith, setSharedWith] = useState<string[]>(friends.map((f) => f.email));
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (prefilledExperienceId) setExperienceId(prefilledExperienceId);
  }, [prefilledExperienceId]);

  const selectedExperience = experiences.find((e) => e.id === experienceId);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleFriend = (email: string) => {
    setSharedWith((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]));
  };

  const toggleTag = (value: string) => {
    setTags((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const resetForm = () => {
    setExperienceId('');
    setRating(0);
    setVibeRating(0);
    setValueRating(0);
    setUniquenessRating(0);
    setCaption('');
    setNotes('');
    setTags([]);
    setPhotoUrl(undefined);
    setSharedWith(friends.map((f) => f.email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceId || rating < 1) return;
    onLog(experienceId, rating, caption.trim(), photoUrl, sharedWith, {
      vibeRating,
      valueRating,
      uniquenessRating,
      tags,
      notes: notes.trim(),
    });
    resetForm();
  };

  const renderStarRow = (
    label: string,
    value: number,
    hover: number,
    setHover: (n: number) => void,
    setValue: (n: number) => void
  ) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-black text-white/80 uppercase tracking-wider min-w-[5.5rem]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setValue(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hover || value) ? 'text-freak-yellow fill-freak-yellow' : 'text-white/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="comic-panel p-5 space-y-6">
      <h3 className="comic-text text-xl flex items-center gap-2 gradient-text">
        <Camera className="w-5 h-5 text-freak-pink" />
        Log a Freakend
      </h3>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 block">Experience</label>
        <select
          value={experienceId}
          onChange={(e) => setExperienceId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-freak-pink focus:ring-2 focus:ring-freak-pink/30 outline-none appearance-none"
        >
          <option value="" className="bg-freak-panel">Pick an experience…</option>
          {experiences.map((exp) => (
            <option key={exp.id} value={exp.id} className="bg-freak-panel">
              {exp.emoji} {exp.title}
            </option>
          ))}
        </select>
      </div>

      {selectedExperience && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="text-3xl">{selectedExperience.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-white truncate">{selectedExperience.title}</div>
            <div className="text-[10px] text-white/50 font-bold uppercase">{selectedExperience.neighborhood}</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-xs font-black text-white/80 uppercase tracking-wider block">Ratings</label>
        {renderStarRow('Overall', rating, hoverRating, setHoverRating, setRating)}
        {renderStarRow('Vibe', vibeRating, hoverVibe, setHoverVibe, setVibeRating)}
        {renderStarRow('Value', valueRating, hoverValue, setHoverValue, setValueRating)}
        {renderStarRow('Unique', uniquenessRating, hoverUniqueness, setHoverUniqueness, setUniquenessRating)}
      </div>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4 text-freak-cyan" />
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const selected = tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  selected
                    ? 'bg-freak-pink text-white border-freak-pink shadow-neon-pink'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 block">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What made it memorable?"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-cyan focus:ring-2 focus:ring-freak-cyan/30 outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-freak-purple" />
          Review notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write a longer review to help friends decide…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-purple focus:ring-2 focus:ring-freak-purple/30 outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 block">Photo</label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-freak-pink file:text-white file:font-black file:uppercase file:text-xs hover:file:bg-freak-pink-glow"
          />
          {isUploading && <span className="text-xs text-freak-cyan mt-2 block">Uploading…</span>}
        </div>
        {photoUrl && (
          <div className="mt-3 relative h-40 rounded-xl overflow-hidden border border-white/10">
            <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-black text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-freak-cyan" />
          Share with
        </label>
        {friends.length === 0 ? (
          <p className="text-sm text-white/50">No friends yet. Add friends in your profile to share.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {friends.map((friend) => {
              const selected = sharedWith.includes(friend.email);
              return (
                <button
                  key={friend.email}
                  type="button"
                  onClick={() => toggleFriend(friend.email)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    selected
                      ? 'bg-freak-cyan text-freak-bg border-freak-cyan shadow-neon-cyan'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                  }`}
                >
                  {friend.avatarEmoji} {friend.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!experienceId || rating < 1}
        className="group relative w-full py-3 rounded-xl font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-freak-pink via-freak-purple to-freak-cyan" />
        <span className="absolute inset-[2px] rounded-xl bg-freak-panel transition-all group-hover:inset-[1px]" />
        <span className="relative flex items-center justify-center gap-2">
          Post to feed <Send className="w-4 h-4 text-freak-yellow" />
        </span>
      </button>
    </form>
  );
}
