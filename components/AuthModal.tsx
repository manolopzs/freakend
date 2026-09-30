'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { Sparkles, Mail, User, Users, Crown, Zap } from 'lucide-react';

interface Props {
  onLogin: (profile: UserProfile) => void;
}

export default function AuthModal({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cohort, setCohort] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@ie.edu') && !trimmedEmail.endsWith('@student.ie.edu')) {
      setError('Please use your IE email address.');
      return;
    }
    if (!name.trim() || !cohort.trim()) {
      setError('Please enter your name and cohort.');
      return;
    }

    onLogin({
      name: name.trim(),
      email: trimmedEmail,
      cohort: cohort.trim().toUpperCase(),
      points: 0,
      level: 1,
      streak: 0,
      lastCompletedDate: null,
      completed: [],
      badges: [],
      friends: [],
      avatarEmoji: '🙂',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-freak-bg/95 backdrop-blur-sm p-4 animate-fade-in">
      <div className="comic-card w-full max-w-md p-6 sm:p-8 animate-pop relative">
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-freak-yellow starburst flex items-center justify-center animate-star-spin">
          <Zap className="w-6 h-6 text-freak-bg" />
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-freak-pink to-freak-purple flex items-center justify-center shadow-neon-pink">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="comic-text text-4xl mb-1 gradient-text">FREAKEND</h1>
          <p className="text-freak-cyan font-black uppercase tracking-widest text-xs">One pull away from a story.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-white/70 uppercase tracking-wider mb-1">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-freak-pink" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-pink focus:ring-2 focus:ring-freak-pink/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-white/70 uppercase tracking-wider mb-1">IE email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-freak-cyan" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@student.ie.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-cyan focus:ring-2 focus:ring-freak-cyan/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-white/70 uppercase tracking-wider mb-1">Cohort</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-freak-purple" />
              <input
                type="text"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                placeholder="e.g. MBA 2026"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-freak-purple focus:ring-2 focus:ring-freak-purple/30 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-bold text-freak-yellow bg-freak-yellow/10 border border-freak-yellow/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="group relative w-full py-3 rounded-xl font-black uppercase tracking-wider text-white transition-all"
          >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-freak-pink via-freak-purple to-freak-cyan" />
            <span className="absolute inset-[2px] rounded-xl bg-freak-panel transition-all group-hover:inset-[1px]" />
            <span className="relative flex items-center justify-center gap-2">
              Start exploring <Sparkles className="w-4 h-4 text-freak-yellow" />
            </span>
          </button>
        </form>

        <p className="text-[10px] text-white/30 text-center mt-4 uppercase tracking-wider">
          Demo login. Production would connect to IE SSO.
        </p>
      </div>
    </div>
  );
}
