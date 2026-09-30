'use client';

import { Home, Compass, PlusCircle, User, Map } from 'lucide-react';

export type Tab = 'feed' | 'explore' | 'add' | 'profile' | 'map';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-freak-panel/95 backdrop-blur-md border-t border-white/10 md:top-0 md:bottom-auto md:left-0 md:right-auto md:w-20 md:h-screen md:border-t-0 md:border-r md:border-white/10">
      <div className="flex justify-around items-center h-16 md:flex-col md:justify-start md:pt-6 md:gap-2 md:h-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all ${
                isActive
                  ? 'text-freak-pink bg-freak-pink/10 shadow-neon-pink'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-freak-pink/20' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
