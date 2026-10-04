'use client';

import { useEffect, useState } from 'react';
import { Experience } from '@/lib/types';
import { budgetLabels, dareLabels } from '@/data/experiences';
import { MapPin, Wallet, Zap, Users, RefreshCw, Check, X, Share2, ExternalLink, PenLine, Bookmark, CalendarPlus } from 'lucide-react';

interface Props {
  experience: Experience | null;
  isGenerating: boolean;
  hasMatches: boolean;
  isSaved?: boolean;
  onGenerate: () => void;
  onAccept: () => void;
  onSkip: () => void;
  onLogExperience?: (experience: Experience) => void;
  onToggleSave?: (experience: Experience) => void;
  onWantToGo?: (experience: Experience) => void;
}

export default function SurpriseCard({
  experience,
  isGenerating,
  hasMatches,
  isSaved = false,
  onGenerate,
  onAccept,
  onSkip,
  onLogExperience,
  onToggleSave,
  onWantToGo,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [leverPulling, setLeverPulling] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (experience) {
      const t = setTimeout(() => setRevealed(true), 100);
      return () => clearTimeout(t);
    }
    setRevealed(false);
  }, [experience]);

  const handleGenerate = () => {
    if (!hasMatches) return;
    setLeverPulling(true);
    setRevealed(false);
    onGenerate();
    setTimeout(() => setLeverPulling(false), 600);
  };

  if (!experience) {
    return (
      <div className="comic-panel p-6 sm:p-8 text-center">
        <div className="relative mx-auto w-28 h-40 mb-6">
          <div className={`lever-base absolute left-1/2 -translate-x-1/2 bottom-0 w-14 h-10 rounded-xl z-10 ${leverPulling ? 'lever-pulling' : ''}`} />
          <div className={`lever-arm absolute left-1/2 -translate-x-1/2 bottom-6 w-3 h-24 bg-gradient-to-t from-gray-500 to-gray-300 rounded-full z-0 ${leverPulling ? 'lever-pulling' : ''}`}>
            <div className="lever-ball absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-freak-pink/20 blur-lg rounded-full" />
        </div>

        <h3 className="comic-text text-2xl sm:text-3xl mb-2 gradient-text">PULL FOR A CHALLENGE</h3>
        <p className="text-white/70 mb-6 max-w-sm mx-auto">
          Set your filters, grab the lever, and let Freakend launch a Madrid dare you would never pick yourself.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !hasMatches}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-freak-pink via-freak-purple to-freak-cyan" />
          <span className="absolute inset-[2px] rounded-xl bg-freak-panel transition-all group-hover:inset-[1px]" />
          <span className="relative flex items-center gap-2">
            {isGenerating ? 'SPINNING...' : 'PULL THE LEVER'}
            <Zap className="w-4 h-4 text-freak-yellow fill-freak-yellow" />
          </span>
        </button>

        {!hasMatches && (
          <p className="mt-4 text-sm font-bold text-freak-yellow">
            No experiences match your filters. Adjust them to unlock a surprise.
          </p>
        )}
      </div>
    );
  }

  const shareText = `I just got dared to try "${experience.title}" on Freakend! Want to join? 🎯`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const sourceLabel =
    experience.source === 'curated'
      ? 'CURATED'
      : experience.source === 'google'
      ? 'GOOGLE PLACES'
      : experience.source === 'madrid'
      ? 'MADRID AGENDA'
      : experience.source === 'dondego'
      ? 'DONDE GO'
      : 'TICKETMASTER';

  return (
    <div className={`comic-card overflow-hidden ${revealed ? 'animate-card-pop' : ''}`}>
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-freak-panel to-black flex items-center justify-center">
        <div className="absolute inset-0 halftone-bg opacity-30" />
        {experience.photoUrl && !imageError ? (
          <img
            src={experience.photoUrl}
            alt={experience.title}
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : null}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-freak-bg/90 via-transparent to-transparent" />
        <div className={`relative z-10 text-center p-6 w-full max-w-full min-w-0 transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-6xl mb-2 drop-shadow-[0_0_18px_rgba(255,0,170,0.5)] animate-float">{experience.emoji}</div>
          <h3 className="comic-text text-xl sm:text-2xl md:text-3xl mb-1 drop-shadow-lg text-white line-clamp-3 break-words">{experience.title}</h3>
          <p className="text-freak-cyan font-bold text-sm uppercase tracking-wider">{experience.neighborhood}</p>
        </div>
        <div className="absolute top-3 right-3 w-10 h-10 bg-freak-yellow starburst flex items-center justify-center animate-star-spin">
          <Zap className="w-5 h-5 text-freak-bg" />
        </div>
        <div className="absolute top-3 left-3 flex gap-2">
          {onToggleSave && (
            <button
              onClick={() => experience && onToggleSave(experience)}
              className={`p-2 rounded-full border transition-all ${
                isSaved
                  ? 'bg-freak-yellow border-freak-yellow text-freak-bg shadow-neon-yellow'
                  : 'bg-freak-panel/70 border-white/20 text-white/70 hover:text-freak-yellow hover:border-freak-yellow'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save experience'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
          {onWantToGo && (
            <button
              onClick={() => experience && onWantToGo(experience)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-freak-cyan/90 border border-freak-cyan text-freak-bg text-[10px] font-black uppercase tracking-wider shadow-neon-cyan hover:bg-freak-cyan transition-colors"
            >
              <CalendarPlus className="w-3 h-3" /> Want to go
            </button>
          )}
        </div>
      </div>

      <div className={`p-5 sm:p-6 transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-white/90 mb-4 text-base leading-relaxed">{experience.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-freak-pink/10 border border-freak-pink/40 text-freak-pink text-xs font-black uppercase">
            <Wallet className="w-3 h-3" /> {budgetLabels[experience.budget]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-freak-cyan/10 border border-freak-cyan/40 text-freak-cyan text-xs font-black uppercase">
            <MapPin className="w-3 h-3" /> {experience.distanceKm} km
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-freak-purple/10 border border-freak-purple/40 text-freak-purple text-xs font-black uppercase">
            <Zap className="w-3 h-3" /> {dareLabels[experience.dareLevel]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-freak-yellow/10 border border-freak-yellow/40 text-freak-yellow text-xs font-black uppercase">
            <Users className="w-3 h-3" /> {experience.vibe}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/20 text-white/70 text-xs font-black uppercase">
            {sourceLabel}
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <p className="text-sm text-white/80 italic mb-2">“{experience.whySpecial}”</p>
          {experience.ieHook && (
            <p className="text-sm font-black text-freak-pink uppercase">{experience.ieHook}</p>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-white/60 mb-2">
          <MapPin className="w-4 h-4 shrink-0 text-freak-cyan" />
          {experience.address}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {experience.mapUrl && (
            <a
              href={experience.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-freak-cyan hover:text-freak-yellow transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View on map
            </a>
          )}
          {experience.eventUrl && (
            <a
              href={experience.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-freak-cyan hover:text-freak-yellow transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Event page
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 font-black uppercase text-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Re-roll
          </button>
          <button
            onClick={onSkip}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 font-black uppercase text-xs transition-colors"
          >
            <X className="w-4 h-4" /> Skip
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-freak-cyan hover:bg-freak-cyan-glow text-freak-bg font-black uppercase text-xs transition-colors"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </a>
          {onLogExperience && (
            <button
              onClick={() => experience && onLogExperience(experience)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-freak-purple hover:bg-freak-violet text-white font-black uppercase text-xs transition-colors shadow-neon-purple"
            >
              <PenLine className="w-4 h-4" /> Log
            </button>
          )}
          <button
            onClick={onAccept}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-freak-pink hover:bg-freak-pink-glow text-white font-black uppercase text-xs transition-colors shadow-neon-pink"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}
