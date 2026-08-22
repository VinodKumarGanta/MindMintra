import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { useTranslation } from '../i18n';
import { useVoice } from '../hooks/useVoice';
import { GameType } from '../types';
import MemoryMatch from '../games/MemoryMatch';
import DailyRoutine from '../games/DailyRoutine';
import ObjectRecognition from '../games/ObjectRecognition';
import PatternRecall from '../games/PatternRecall';
import { ArrowLeft, Star, ChevronRight, Volume2, VolumeX, Sparkles, Brain, CheckCircle2 } from 'lucide-react';

const GAME_TYPES: Record<string, GameType> = {
  memory: 'memory_match',
  routine: 'daily_routine',
  recognition: 'object_recognition',
  pattern: 'pattern_recall',
};

export default function GamePage() {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();
  const { currentUser, currentSession, currentDifficulty, setGameDifficulty } = useAppContext();
  const { t, language } = useTranslation();
  const { speak, stop, voiceEnabled, setVoiceEnabled, isVoiceAvailable } = useVoice();

  const [gameSessionId, setGameSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [adaptiveResult, setAdaptiveResult] = useState<any>(null);

  const gt = gameType ? GAME_TYPES[gameType] : 'memory_match';
  const difficulty = currentDifficulty[gt] || 1;

  useEffect(() => {
    async function startGame() {
      if (!currentUser || !currentSession) {
        navigate('/session');
        return;
      }
      try {
        const result = await api.startGameSession({
          session_id: currentSession.id,
          user_id: currentUser.id,
          game_type: gt,
          difficulty,
        });
        setGameSessionId(result.id);
      } catch (err) {
        setGameSessionId(Date.now());
      }
      setLoading(false);
    }
    startGame();
  }, []);

  const getLocalizedInstruction = useCallback(() => {
    if (gameType === 'memory') {
      if (language === 'te') return 'రెండు సరిపోలే కార్డులను జత చేయండి. నెమ్మదిగా ఆడండి.';
      if (language === 'hi') return 'आइए मिलकर कार्डों का मिलान करें। आराम से खेलें।';
      return 'Let us match the cards together. Take your time.';
    } else if (gameType === 'routine') {
      if (language === 'te') return 'రోజువారీ పనుల క్రమాన్ని జాగ్రత్తగా గుర్తుంచుకోండి.';
      if (language === 'hi') return 'दैनिक गतिविधियों के इस क्रम को याद रखें।';
      return 'Remember this sequence of daily activities.';
    } else if (gameType === 'recognition') {
      if (language === 'te') return 'ప్రశ్నకు సరిపోయే సరైన చిత్రాన్ని ఎంచుకోండి.';
      if (language === 'hi') return 'प्रश्न का उत्तर देने वाली सही छवि चुनें।';
      return 'Choose the image that matches the question.';
    } else if (gameType === 'pattern') {
      if (language === 'te') return 'నక్షత్రాల ప్యాటర్న్‌ను గమనించి సరైన దానిని ఎంచుకోండి.';
      if (language === 'hi') return 'नक्षत्र पैटर्न को देखें और सही मिलान खोजें।';
      return 'Observe the star pattern and find the matching one.';
    }
    return 'Let us begin the exercise.';
  }, [gameType, language]);

  const speakPrompt = useCallback((text?: string) => {
    const speechText = text || getLocalizedInstruction();
    speak(speechText, language);
  }, [speak, language, getLocalizedInstruction]);

  useEffect(() => {
    if (!loading && !finished) {
      speakPrompt();
    }
  }, [loading, finished, speakPrompt]);

  const handleComplete = useCallback(async (metrics: any) => {
    if (!currentUser || !gameSessionId) return;

    try {
      await api.completeGameSession(gameSessionId, {
        accuracy: metrics.accuracy,
        avg_response_time_ms: metrics.avg_response_time_ms,
        repeat_errors: metrics.repeat_errors,
        corrections: metrics.corrections,
        completion_time_ms: metrics.completion_time_ms,
        total_events: metrics.total_events,
      });

      const adaptRec = await api.getAdaptiveRecommendation(currentUser.id, gt, {
        accuracy: metrics.accuracy,
        mean_response_time_ms: metrics.avg_response_time_ms,
        response_time_variance: 0.2,
        repeat_error_rate: metrics.repeat_errors / Math.max(metrics.total_events, 1),
        correction_rate: metrics.corrections / Math.max(metrics.total_events, 1),
        completion_time_ms: metrics.completion_time_ms,
        current_difficulty: difficulty,
      });

      setAdaptiveResult(adaptRec);
      if (adaptRec.recommended_difficulty) {
        setGameDifficulty(gt, adaptRec.recommended_difficulty);
      }
    } catch (err) {
      console.error('Error completing game:', err);
    }

    setFinished(true);
    const praise = language === 'te'
      ? 'చాలా అద్భుతంగా చేశారు! ముందుకు సాగుదాం.'
      : language === 'hi'
      ? 'शानदार काम किया! आइए आगे बढ़ें।'
      : 'Wonderful job! Let us continue.';
    speakPrompt(praise);
  }, [currentUser, gameSessionId, gt, difficulty, setGameDifficulty, language, speakPrompt]);

  const handleContinue = () => {
    if (gameType) {
      sessionStorage.setItem(`mindmitra_game_done_${gameType}`, 'true');
      sessionStorage.setItem('mindmitra_last_game', gameType);
    }
    navigate('/session');
  };

  const getGameTitle = () => {
    if (gameType === 'memory') return t.games.memory.title || 'Memory Match';
    if (gameType === 'routine') return t.games.routine.title || 'Daily Routine Recall';
    if (gameType === 'recognition') return t.games.recognition.title || 'Object & Familiar Person Recognition';
    if (gameType === 'pattern') return t.games.pattern.title || 'Pattern Recall';
    return 'Cognitive Activity';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center cosmic-card p-10">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-2xl text-slate-200">Preparing your activity...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col relative z-10"
    >
      {/* Distraction-Free Header for Elderly Game Focus (Section 34) */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <button
          onClick={() => navigate('/session')}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-slate-900/60 border border-indigo-500/20 text-base font-semibold"
        >
          <ArrowLeft size={20} /> {t.common.back || 'Back'}
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            {getGameTitle()}
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            {[1, 2, 3, 4].map(lvl => (
              <span
                key={lvl}
                className={`w-2.5 h-2.5 rounded-full ${
                  lvl <= difficulty ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-slate-800'
                }`}
              />
            ))}
            <span className="text-xs text-indigo-300 ml-1.5 font-medium">Level {difficulty}</span>
          </div>
        </div>

        {/* Voice Control Buttons [🔊 Listen] / [🔇 Mute] */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => speakPrompt()}
            className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-400/40 text-indigo-200 hover:text-white hover:bg-indigo-900 flex items-center gap-1.5 text-xs font-semibold"
            title="Listen to instructions"
          >
            <Volume2 size={18} className="text-emerald-400" />
            <span className="hidden sm:inline">{t.common.listen || 'Listen'}</span>
          </button>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold ${
              voiceEnabled
                ? 'bg-slate-900/80 border-indigo-500/30 text-slate-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-500'
            }`}
            title="Toggle voice assistant"
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Main Game Surface */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        {!finished ? (
          <div className="w-full max-w-4xl">
            {gameType === 'memory' && (
              <MemoryMatch
                difficulty={difficulty}
                userId={currentUser?.id || 1}
                gameSessionId={gameSessionId || 1}
                onComplete={handleComplete}
              />
            )}
            {gameType === 'routine' && (
              <DailyRoutine
                difficulty={difficulty}
                userId={currentUser?.id || 1}
                gameSessionId={gameSessionId || 1}
                onComplete={handleComplete}
              />
            )}
            {gameType === 'recognition' && (
              <ObjectRecognition
                difficulty={difficulty}
                userId={currentUser?.id || 1}
                gameSessionId={gameSessionId || 1}
                onComplete={handleComplete}
              />
            )}
            {gameType === 'pattern' && (
              <PatternRecall
                difficulty={difficulty}
                userId={currentUser?.id || 1}
                gameSessionId={gameSessionId || 1}
                onComplete={handleComplete}
              />
            )}
          </div>
        ) : (
          /* Post-Game Transition with Real Adaptive Decision Explanation */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cosmic-card p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-300 mx-auto mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={44} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              {t.session.great_work || 'Great work today!'}
            </h2>
            <p className="text-lg text-indigo-200 mb-6 font-light">
              Activity completed successfully.
            </p>

            {/* Adaptive AI Decision Card (Section 22 & 23) */}
            {adaptiveResult && (
              <div className="mb-6 p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={20} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">Adaptive Intelligence Calibration</span>
                  <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
                    {adaptiveResult.model_used === 'ml' ? 'RandomForest Classifier' : 'Adaptive Engine'}
                  </span>
                </div>

                <div className="flex items-center justify-between my-3 p-3 bg-slate-950/70 rounded-xl border border-indigo-500/20">
                  <div>
                    <span className="text-xs text-slate-400">Previous Level</span>
                    <p className="text-xl font-bold text-slate-200">Level {adaptiveResult.previous_difficulty || difficulty}</p>
                  </div>
                  <ChevronRight size={24} className="text-indigo-400" />
                  <div>
                    <span className="text-xs text-slate-400">Next Recommended</span>
                    <p className="text-xl font-bold text-indigo-300">Level {adaptiveResult.recommended_difficulty || difficulty}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Why did difficulty change?</strong> {adaptiveResult.reason || 'Performance calibrated with your moving baseline to maintain positive cognitive engagement.'}
                </p>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="elderly-btn-primary w-full text-xl font-bold py-4 flex items-center justify-center gap-2 shadow-xl"
            >
              <span>✨</span> {t.session.lets_continue || 'Let\'s Continue'} <ChevronRight size={22} />
            </button>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
