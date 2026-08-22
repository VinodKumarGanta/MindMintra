import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppContext } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { api } from '../services/api';
import { User, Language } from '../types';
import { Brain, ArrowRight, Activity, Volume2, VolumeX, Globe, Users, Sparkles, ShieldCheck, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Welcome() {
  const { t, language, setLanguage } = useTranslation();
  const { setCurrentUser } = useAppContext();
  const { speak, testVoice, isSpeaking, isPreparingCloudAudio, voiceEnabled, setVoiceEnabled, isVoiceAvailable, detectedVoice, ttsProvider, lastLocale } = useVoice();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [voiceTestFeedback, setVoiceTestFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api.getUsers();
        const unique = Array.from(new Map(data.map(item => [item.display_name, item])).values());
        setUsers(unique);
        if (unique.length > 0) {
          setSelectedUserId(unique[0].id);
        }
      } catch (err) {
        console.log('Could not load users, backend offline');
      }
    }
    loadUsers();
  }, []);

  const handleStart = () => {
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        setCurrentUser(user);
        if (user.preferred_language && (user.preferred_language === 'en' || user.preferred_language === 'hi' || user.preferred_language === 'te')) {
          setLanguage(user.preferred_language as Language);
        }
        navigate('/session');
        return;
      }
    }
    navigate('/onboarding');
  };

  const handleRunVoiceTest = async (lang: Language) => {
    setVoiceTestFeedback(lang === 'te' ? '🔊 Preparing Telugu voice...' : '🔊 Preparing speech...');
    const result = await testVoice(lang);
    if (result && result.success) {
      setVoiceTestFeedback(`✓ Spoken in ${lang.toUpperCase()} via ${result.voiceName} [${result.source}]`);
    } else {
      setVoiceTestFeedback(`⚠ ${result?.error || 'Voice unavailable on this device. Displaying text.'}`);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center relative z-10 min-h-[90vh]">
      {/* Title & Cosmic Neural Metaphor */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-24 h-24 rounded-3xl bg-indigo-950/80 border-2 border-indigo-400/50 flex items-center justify-center text-indigo-200 mb-6 shadow-[0_0_35px_rgba(99,102,241,0.3)] relative"
        >
          <Brain size={52} className="text-indigo-300 drop-shadow-[0_0_12px_#818cf8]" />
          <Sparkles size={24} className="text-amber-300 absolute -top-2 -right-2 animate-pulse" />
        </motion.div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {t.common.app_name || 'MindMitra'}
        </h1>
        <p className="text-xl sm:text-2xl text-indigo-200 font-light tracking-wide max-w-lg leading-relaxed">
          {t.common.tagline || 'An AI companion for cognitive wellbeing.'}
        </p>
        <p className="text-sm text-slate-400 mt-1 max-w-md">
          {t.welcome.subtitle || 'Exploring the universe of the mind.'}
        </p>
      </div>

      {/* Main Action Card */}
      <div className="w-full max-w-md cosmic-card p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-lg text-slate-200 font-medium flex items-center gap-2">
              <span>👤</span> {t.onboarding.select_user || 'Select User Profile'}
            </label>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-500 text-indigo-100 border border-indigo-400/40 transition-all flex items-center gap-1 shadow"
            >
              + Create New User
            </button>
          </div>
          <select
            value={selectedUserId ?? 'new'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'new' || !val) {
                setSelectedUserId(null);
                navigate('/onboarding');
              } else {
                setSelectedUserId(Number(val));
              }
            }}
            className="w-full text-xl p-4 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white focus:border-indigo-400 focus:outline-none shadow-inner"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.display_name} (Age {u.age})
              </option>
            ))}
            <option value="new">— + Create New User Profile —</option>
          </select>
        </div>

        {selectedUserId ? (
          <button
            onClick={handleStart}
            className="elderly-btn-primary w-full text-2xl font-bold py-5 flex items-center justify-center gap-3"
          >
            <span>✨</span> {t.welcome.start_session || 'Start Daily Session'} <ArrowRight size={24} />
          </button>
        ) : (
          <button
            onClick={() => navigate('/onboarding')}
            className="elderly-btn-primary w-full text-2xl font-bold py-5 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-indigo-600"
          >
            <span>➕</span> Create New User Details <ArrowRight size={24} />
          </button>
        )}

        <button
          onClick={() => navigate('/caregiver')}
          className="elderly-btn-secondary w-full text-xl font-semibold py-4 flex items-center justify-center gap-2"
        >
          <Activity size={22} /> {t.welcome.caregiver_dashboard || 'Caregiver Dashboard'}
        </button>
      </div>

      {/* 3-Language First-Class Support Switcher & Test Section */}
      <div className="mt-8 flex flex-col items-center gap-3 max-w-md w-full">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-indigo-500/30 w-full justify-between">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-all ${language === 'en'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-all ${language === 'hi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-all ${language === 'te'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
          >
            తెలుగు
          </button>
        </div>

        {/* Language Test Controls (Section 10) */}
        <div className="w-full cosmic-card p-4 flex flex-col gap-2.5 border border-indigo-500/20 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Volume2 size={16} className="text-emerald-400" />
              Language & Voice Test
            </span>
            <button
              onClick={() => handleRunVoiceTest(language)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Play size={12} fill="white" /> 🔊 Test Voice
            </button>
          </div>

          <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
            <span>Locale: {lastLocale}</span>
            <span>
              Voice: {isVoiceAvailable ? (
                <span className="text-emerald-400 font-bold">✓ {detectedVoice?.name.split(' ')[0] || 'Ready'}</span>
              ) : (
                <span className="text-amber-400 font-bold">⚠ Unavailable on device</span>
              )}
            </span>
          </div>

          {voiceTestFeedback && (
            <div className="p-2 bg-slate-900 rounded-lg text-slate-200 text-[11px] border border-indigo-500/20">
              {voiceTestFeedback}
            </div>
          )}
        </div>

        {/* Controls: Voice Toggle & Demo Shortcut */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 px-4 py-2 bg-slate-900/70 rounded-xl border border-indigo-500/30 hover:border-indigo-400 hover:text-white transition-all"
          >
            {voiceEnabled ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
            {voiceEnabled ? 'Voice Guidance: ON' : 'Voice Guidance: OFF'}
          </button>

          <button
            onClick={() => navigate('/demo')}
            className="flex items-center gap-1.5 text-sm font-medium text-purple-300 px-4 py-2 bg-purple-950/40 rounded-xl border border-purple-500/30 hover:border-purple-400 hover:text-purple-200 transition-all"
          >
            <Sparkles size={16} /> Judge Demo
          </button>
        </div>
      </div>
    </div>
  );
}
