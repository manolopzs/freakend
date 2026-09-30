'use client';

import { useState } from 'react';
import { Experience } from '@/lib/types';
import { budgetLabels, dareLabels } from '@/data/experiences';
import { MapPin, Wallet, Zap, Users, Sparkles, RefreshCw, Check, X, Share2, ExternalLink } from 'lucide-react';

interface Props {
  experience: Experience | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onAccept: () => void;
  onSkip: () => void;
}

export default function SurpriseCard({ experience, isGenerating, onGenerate, onAccept, onSkip }: Props) {
  const [revealed, setRevealed] = useState(false);

  const handleGenerate = () => {
    setRevealed(false);
    onGenerate();
    setTimeout(() => setRevealed(true), 900);
  };

  if (!experience) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-ie-red" />
        </div>
        <h3 className="text-xl font-bold mb-2">Ready for a surprise?</h3>
        <p className="text-gray-600 mb-6">Set your filters and let Freakend pick a Madrid experience you might never choose yourself.</p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-ie-red hover:bg-red-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {isGenerating ? 'Choosing...' : 'Surprise Me'}
        </button>
      </div>
    );
  }

  const shareText = `I just got dared to try "${experience.title}" on Freakend! Want to join? 🎯`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        {experience.photoUrl ? (
          <img
            src={experience.photoUrl}
            alt={experience.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : null}
        <div className={`relative z-10 text-center p-6 transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-5xl mb-2 drop-shadow-lg">{experience.emoji}</div>
          <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{experience.title}</h3>
          <p className="text-white/80 text-sm">{experience.neighborhood}</p>
        </div>
      </div>

      <div className={`p-6 transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-gray-700 mb-4">{experience.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-ie-red text-xs font-medium">
            <Wallet className="w-3 h-3" /> {budgetLabels[experience.budget]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <MapPin className="w-3 h-3" /> {experience.distanceKm} km
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
            <Zap className="w-3 h-3" /> {dareLabels[experience.dareLevel]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            <Users className="w-3 h-3" /> {experience.vibe}
          </span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            experience.source === 'curated' ? 'bg-gray-100 text-gray-600' :
            experience.source === 'google' ? 'bg-orange-50 text-orange-700' :
            experience.source === 'eventbrite' ? 'bg-orange-50 text-orange-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {experience.source === 'curated' ? 'Curated' :
             experience.source === 'google' ? 'Google Places' :
             experience.source === 'eventbrite' ? 'Eventbrite' : 'Ticketmaster'}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600 italic mb-2">“{experience.whySpecial}”</p>
          {experience.ieHook && (
            <p className="text-sm font-medium text-ie-red">{experience.ieHook}</p>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 mb-2">
          <MapPin className="w-4 h-4 shrink-0" />
          {experience.address}
        </div>

        <div className="flex gap-2 mb-6">
          {experience.mapUrl && (
            <a
              href={experience.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ie-red hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> View on map
            </a>
          )}
          {experience.eventUrl && (
            <a
              href={experience.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ie-red hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Get tickets
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Re-roll
          </button>
          <button
            onClick={onSkip}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <X className="w-4 h-4" /> Skip
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </a>
          <button
            onClick={onAccept}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ie-red hover:bg-red-800 text-white font-medium transition-colors"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}
