'use client';

import { Experience } from '@/lib/types';
import { MapPin, Bookmark, CalendarPlus, ExternalLink, PenLine } from 'lucide-react';

interface Props {
  experience: Experience;
  isSaved?: boolean;
  showActions?: boolean;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
  onLogExperience?: (experience: Experience) => void;
  className?: string;
}

export default function ExperienceCard({
  experience,
  isSaved = false,
  showActions = true,
  onToggleSave,
  onWantToGo,
  onLogExperience,
  className = '',
}: Props) {
  return (
    <div className={`comic-card flex-shrink-0 w-72 overflow-hidden group snap-start ${className}`}>
      <div className="relative h-36 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center">
        {experience.photoUrl ? (
          <img
            src={experience.photoUrl}
            alt={experience.title}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-freak-bg/90 via-transparent to-transparent" />
        <div className="relative z-10 text-center px-4 w-full max-w-full min-w-0">
          <div className="text-4xl mb-1 drop-shadow-[0_0_12px_rgba(255,0,170,0.5)]">{experience.emoji}</div>
          <h3 className="comic-text text-sm sm:text-base text-white line-clamp-2 break-words">{experience.title}</h3>
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          {showActions && onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(experience);
              }}
              className={`p-2 rounded-full border transition-all ${
                isSaved
                  ? 'bg-freak-yellow border-freak-yellow text-freak-bg shadow-neon-yellow'
                  : 'bg-freak-panel/80 border-white/20 text-white/70 hover:text-freak-yellow hover:border-freak-yellow'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save experience'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-freak-cyan mb-2">
          <MapPin className="w-3 h-3" />
          {experience.neighborhood}
          <span className="text-white/40 mx-1">·</span>
          <span className="text-white/50">{experience.distanceKm} km</span>
        </div>

        <p className="text-white/70 text-xs line-clamp-2 mb-3 leading-relaxed">{experience.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-full bg-freak-pink/10 border border-freak-pink/40 text-freak-pink text-[9px] font-black uppercase truncate max-w-[45%]">
            {experience.type}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-freak-cyan/10 border border-freak-cyan/40 text-freak-cyan text-[9px] font-black uppercase truncate max-w-[45%]">
            {experience.vibe}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-freak-purple/10 border border-freak-purple/40 text-freak-purple text-[9px] font-black uppercase">
            {'€'.repeat(experience.budget)}
          </span>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onWantToGo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWantToGo(experience);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-white/5 hover:bg-freak-cyan/20 border border-white/10 hover:border-freak-cyan text-freak-cyan text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                <CalendarPlus className="w-3 h-3" /> Want to go
              </button>
            )}
            {onLogExperience && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogExperience(experience);
                }}
                className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-freak-purple/20 hover:bg-freak-purple/40 border border-freak-purple/40 text-freak-purple text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                <PenLine className="w-3 h-3" /> Log
              </button>
            )}
            {experience.mapUrl && (
              <a
                href={experience.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
