import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ListOrdered, Search, Sparkles, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const ACTIVITIES = [
  {
    id: 'memory',
    type: 'memory_match',
    title: 'Memory Match',
    domain: 'Short-Term Memory',
    desc: 'Match celestial and everyday symbols to stimulate recall.',
    icon: Brain,
    emoji: '🧠',
  },
  {
    id: 'routine',
    type: 'daily_routine',
    title: 'Daily Routine Recall',
    domain: 'Sequential Memory',
    desc: 'Remember and reconstruct sequences of familiar daily tasks.',
    icon: ListOrdered,
    emoji: '📋',
  },
  {
    id: 'recognition',
    type: 'object_recognition',
    title: 'Object & Familiar Person Recognition',
    domain: 'Visual Recognition',
    desc: 'Identify familiar everyday objects and family members.',
    icon: Search,
    emoji: '🔍',
  },
  {
    id: 'pattern',
    type: 'pattern_recall',
    title: 'Pattern Recall',
    domain: 'Pattern Recognition & Attention',
    desc: 'Observe constellation patterns and find matching structures.',
    icon: Sparkles,
    emoji: '✨',
  },
];

export default function Session() {
  const { t } = useTranslation();
  const { currentUser, setCurrentSession, currentDifficulty } = useApp();
  const navigate = useNavigate();
  const [completedGames, setCompletedGames] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('mindmitra_completed_games');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionId, setSessionId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('mindmitra_session_id');
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/onboarding');
      return;
    }
    async function initSession() {
      if (!sessionId && currentUser) {
        try {
          const result = await api.startSession(currentUser.id);
          setSessionId(result.id);
          sessionStorage.setItem('mindmitra_session_id', String(result.id));
          setCurrentSession({
            id: result.id,
            user_id: currentUser.id,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
          });
        } catch (err) {
          const fakeId = Date.now();
          setSessionId(fakeId);
          sessionStorage.setItem('mindmitra_session_id', String(fakeId));
          setCurrentSession({
            id: fakeId,
            user_id: currentUser.id,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
          });
        }
      }
    }
    initSession();
  }, [currentUser]);

  const markGameComplete = (gameId: string) => {
    setCompletedGames(prev => {
      if (prev.includes(gameId)) return prev;
      const updated = [...prev, gameId];
      sessionStorage.setItem('mindmitra_completed_games', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const lastPlayed = sessionStorage.getItem('mindmitra_last_game');
    if (lastPlayed) {
      const wasCompleted = sessionStorage.getItem(`mindmitra_game_done_${lastPlayed}`);
      if (wasCompleted === 'true') {
        markGameComplete(lastPlayed);
        sessionStorage.removeItem(`mindmitra_game_done_${lastPlayed}`);
      }
    }
  }, []);

  const handlePlay = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  const allCompleted = ACTIVITIES.every(g => completedGames.includes(g.id));

  const handleCompleteSession = async () => {
    if (sessionId) {
      try {
        await api.completeSession(sessionId);
      } catch {}
    }
    sessionStorage.removeItem('mindmitra_completed_games');
    sessionStorage.removeItem('mindmitra_session_id');
    navigate('/session/complete');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 md:p-12 relative z-10"
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20"
          >
            <ArrowLeft size={20} /> Back to Welcome
          </button>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Today's Exploration Session
          </h1>
          <p className="text-xl text-slate-300">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {currentUser && (
            <p className="text-lg text-indigo-300 mt-2 font-medium">
              Welcome, {currentUser.display_name} • Exploring the Universe of the Mind
            </p>
          )}
        </header>

        {/* 4 Activities List */}
        <div className="flex flex-col gap-5">
          {ACTIVITIES.map((activity, index) => {
            const isCompleted = completedGames.includes(activity.id);
            const diff = currentDifficulty[activity.type as keyof typeof currentDifficulty] || 1;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`cosmic-card p-6 sm:p-7 border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-indigo-500/30 hover:border-indigo-400/80 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-2xl text-3xl shrink-0 ${
                      isCompleted ? 'bg-emerald-900/60 border border-emerald-400/40 text-emerald-300' : 'bg-indigo-900/40 border border-indigo-400/30 text-indigo-200'
                    }`}>
                      {isCompleted ? '✓' : activity.emoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{activity.title}</h2>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-semibold">
                          Level {diff}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-indigo-300/80 mt-0.5">{activity.domain}</p>
                      <p className="text-base text-slate-300 mt-1">{activity.desc}</p>
                    </div>
                  </div>

                  <div className="flex sm:justify-end">
                    {!isCompleted ? (
                      <button
                        onClick={() => handlePlay(activity.id)}
                        className="elderly-btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        Play <ChevronRight size={24} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xl font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-6 py-3 rounded-xl w-full sm:w-auto justify-center">
                        <CheckCircle size={22} /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Action */}
        <div className="mt-10 text-center">
          {allCompleted ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleCompleteSession}
              className="elderly-btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 text-3xl font-bold py-6 px-14 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              ✨ Complete Session & View Insights
            </motion.button>
          ) : (
            <div className="text-slate-400 text-lg">
              {completedGames.length} of {ACTIVITIES.length} activities completed today
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
