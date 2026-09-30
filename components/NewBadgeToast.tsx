'use client';

import { Badge } from '@/lib/types';
import { Award, Sparkles, Crown } from 'lucide-react';

interface Props {
  badge?: Badge | null;
  onClose: () => void;
}

export default function NewBadgeToast({ badge, onClose }: Props) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-freak-bg/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="comic-card p-6 sm:p-8 text-center max-w-sm w-full animate-card-pop relative">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-freak-yellow starburst flex items-center justify-center animate-star-spin shadow-neon-yellow">
          <Crown className="w-7 h-7 text-freak-bg" />
        </div>
        <div className="w-16 h-16 mx-auto mb-3 mt-4 rounded-full bg-gradient-to-br from-freak-pink to-freak-purple flex items-center justify-center shadow-neon-pink">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div className="text-5xl mb-3 animate-float">{badge.emoji}</div>
        <h3 className="comic-text text-2xl mb-1 text-white">Badge Unlocked!</h3>
        <p className="text-lg font-black text-freak-pink uppercase mb-1">{badge.name}</p>
        <p className="text-white/70 text-sm mb-6">{badge.description}</p>
        <button
          onClick={onClose}
          className="group relative w-full py-3 rounded-xl font-black uppercase tracking-wider text-white transition-all"
        >
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-freak-pink via-freak-purple to-freak-cyan" />
          <span className="absolute inset-[2px] rounded-xl bg-freak-panel transition-all group-hover:inset-[1px]" />
          <span className="relative flex items-center justify-center gap-2">
            Keep exploring <Sparkles className="w-4 h-4 text-freak-yellow" />
          </span>
        </button>
      </div>
    </div>
  );
}
