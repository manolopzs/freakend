'use client';

import { Badge } from '@/lib/types';
import { Award } from 'lucide-react';

interface Props {
  badge?: Badge | null;
  onClose: () => void;
}

export default function NewBadgeToast({ badge, onClose }: Props) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full animate-pop">
        <div className="w-16 h-16 bg-ie-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-ie-red" />
        </div>
        <div className="text-5xl mb-3">{badge.emoji}</div>
        <h3 className="text-xl font-bold mb-1">Badge Unlocked!</h3>
        <p className="text-lg font-semibold text-ie-red mb-1">{badge.name}</p>
        <p className="text-gray-600 text-sm mb-6">{badge.description}</p>
        <button
          onClick={onClose}
          className="w-full bg-ie-red hover:bg-red-800 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Keep exploring
        </button>
      </div>
    </div>
  );
}
