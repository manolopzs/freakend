'use client';

import { Experience, DareLevel } from '@/lib/types';
import { Crown, Sparkles, ExternalLink } from 'lucide-react';

interface Props {
  experience: Experience | null;
  level: DareLevel;
  onClose: () => void;
}

export default function DareAcceptedToast({ experience, level, onClose }: Props) {
  if (!experience) return null;

  const cardStyleByLevel: Record<DareLevel, string> = {
    1: 'bg-white border-2 border-gray-300 rounded-none shadow-sm text-gray-800 font-boring',
    2: 'bg-white/95 backdrop-blur-md border-2 border-slate-200 shadow-md rounded-2xl text-slate-900 font-sans',
    3: 'bg-slate-900/90 backdrop-blur-xl border-2 border-pink-500 rounded-2xl text-pink-200 font-sans shadow-neon-pink',
    4: 'bg-black/90 backdrop-blur-md border-2 border-emerald-500 rounded-none text-emerald-400 font-mono shadow-[0_0_25px_rgba(16,185,129,0.4)]',
    5: 'bg-black/95 backdrop-blur-md border-4 border-dashed border-fuchsia-500 rounded-[35px_15px_40px_20px] text-fuchsia-300 font-mono shadow-[0_0_60px_rgba(217,70,239,1)] animate-chaotic-shake p-6 rotate-1',
  };

  const badgeByLevel: Record<DareLevel, string> = {
    1: 'bg-gray-800 text-white rounded-none border border-gray-900 font-boring text-xs',
    2: 'bg-[#002147] text-white rounded-lg shadow-sm font-sans text-xs',
    3: 'bg-pink-500 text-black font-bold rounded-lg shadow-md shadow-pink-500/50 font-sans text-xs',
    4: 'bg-emerald-500 text-black font-bold rounded-none shadow-[0_0_15px_rgba(16,185,129,0.8)] font-mono text-xs',
    5: 'bg-fuchsia-600 text-yellow-300 font-bold rounded-none border-4 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,1)] font-mono animate-psycho-text animate-chaotic-shake text-xs',
  };

  const levelNames: Record<DareLevel, string> = {
    1: 'Tame',
    2: 'IE Appropriate',
    3: 'Todos Santos',
    4: 'Enter the Matrix',
    5: 'You Gone',
  };

  const isChaos = level === 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-freak-bg/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`comic-card max-w-sm w-full text-center relative ${cardStyleByLevel[level]}`}>
        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center shadow-neon-yellow ${level === 5 ? 'bg-fuchsia-600 border-4 border-cyan-400 starburst animate-star-spin' : level === 4 ? 'bg-emerald-500 starburst' : level === 3 ? 'bg-pink-500 starburst animate-star-spin' : 'bg-freak-yellow starburst animate-star-spin'}`}>
          <Crown className={`w-7 h-7 ${level >= 4 ? 'text-black' : 'text-freak-bg'}`} />
        </div>

        <div className="pt-8 pb-2 px-6">
          <div className="text-5xl mb-3 animate-float">{experience.emoji}</div>
          <span className={`inline-block px-3 py-1 mb-3 font-black uppercase tracking-wider ${badgeByLevel[level]}`}>
            {isChaos ? '⚡ REALITY BROKEN ⚡' : `Dare accepted • Level ${level}`}
          </span>
          <h3 className={`text-xl sm:text-2xl mb-1 ${isChaos ? 'text-yellow-300 uppercase animate-psycho-text animate-chaotic-shake' : level === 4 ? 'text-emerald-300 uppercase tracking-widest font-bold' : level === 3 ? 'text-pink-300 uppercase font-bold' : 'text-current font-black'}`}>
            {isChaos ? 'YOU ARE NOW THE DARE' : experience.title}
          </h3>
          {!isChaos && (
            <p className="text-xs opacity-70 mt-1">{experience.neighborhood} · {experience.distanceKm} km</p>
          )}
          <p className={`text-sm mt-3 mb-5 ${isChaos ? 'text-cyan-300 font-mono font-bold animate-chaotic-shake' : level === 4 ? 'text-emerald-300/80 font-mono uppercase text-xs' : 'opacity-80'}`}>
            {isChaos
              ? 'THE EVENT HAS BEEN INGESTED. THERE IS NO TURNING BACK.'
              : `Added to your completed dares at the ${levelNames[level]} level.`}
          </p>

          <button
            onClick={onClose}
            className={`group relative w-full py-3 rounded-xl font-black uppercase tracking-wider transition-all ${isChaos ? 'text-yellow-300' : 'text-white'}`}
          >
            <span className={`absolute inset-0 rounded-xl ${level === 5 ? 'bg-gradient-to-r from-fuchsia-600 via-cyan-400 to-yellow-400' : level === 4 ? 'bg-emerald-500' : level === 3 ? 'bg-gradient-to-r from-freak-pink to-freak-purple' : level === 2 ? 'bg-[#002147]' : 'bg-gray-800'}`} />
            <span className="absolute inset-[2px] rounded-xl bg-freak-panel transition-all group-hover:inset-[1px]" />
            <span className="relative flex items-center justify-center gap-2 text-white">
              {isChaos ? 'DISSOLVE' : 'Keep exploring'} <Sparkles className="w-4 h-4 text-freak-yellow" />
            </span>
          </button>

          {experience.eventUrl && (
            <a
              href={experience.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
                level === 5
                  ? 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
                  : level === 4
                  ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                  : level === 3
                  ? 'border-pink-500 text-pink-300 hover:bg-pink-500/10'
                  : level === 2
                  ? 'border-[#002147] text-slate-800 hover:bg-slate-100'
                  : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Event page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
