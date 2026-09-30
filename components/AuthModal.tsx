'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { Sparkles, Mail, User, Users } from 'lucide-react';

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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ie-dark/80 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-pop">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-ie-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-ie-red" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Freakend</h1>
          <p className="text-gray-600">Surprise Madrid experiences for IE MBA students.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ie-red focus:ring-2 focus:ring-ie-red/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IE email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@student.ie.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ie-red focus:ring-2 focus:ring-ie-red/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                placeholder="e.g. MBA 2026"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ie-red focus:ring-2 focus:ring-ie-red/20 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-ie-red hover:bg-red-800 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Start exploring
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          This is a demo login. In production it would connect to IE SSO.
        </p>
      </div>
    </div>
  );
}
