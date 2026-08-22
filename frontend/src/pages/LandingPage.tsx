import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowRight,
  Heart,
  Users,
  Lock,
  CloudOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  ChevronRight,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <BrainCircuit size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">MindMitra</span>
              <span className="text-xs text-indigo-300 font-semibold block -mt-1">Cognitive Companion</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/methodology"
              className="hidden md:inline-flex text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Methodology
            </Link>
            <Link
              to="/demo"
              className="hidden md:inline-flex text-sm font-medium text-purple-300 hover:text-purple-200 px-4 py-2 transition-colors"
            >
              Live Demo
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-white px-4 py-2 bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400 rounded-xl transition-all"
            >
              <LogIn size={16} />
              Caretaker Login
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Sparkles size={14} className="text-amber-400" />
          AI-Powered Cognitive Healthcare Companion
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-none mb-6"
        >
          Exploring the Mind Like <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Exploring a Universe
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-300 font-light max-w-4xl mx-auto leading-relaxed mb-10"
        >
          MindMitra is an AI-powered cognitive companion for elderly users that learns from how they interact with short cognitive activities, adapts to their performance, and helps caregivers understand changes over time through explainable insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3"
          >
            <span>Start Activity Session</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/auth/login')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white text-lg font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            <span>Caretaker Portal</span>
          </button>
        </motion.div>


        {/* Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="cosmic-card p-6 sm:p-10 border border-indigo-500/30 max-w-5xl mx-auto shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/20">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-4">
                <Heart size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Gentle Senior Experience</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Large 48px+ touch targets, calm pacing, bilingual voice options (English, Hindi, Telugu), and zero clinical pressure.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-4">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">RandomForest ML Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Continuously evaluates reaction latency, repetition errors, and hesitation time to adjust challenge levels dynamically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-4">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Caregiver Longitudinal Baseline</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tracks multi-session trend variance over time with explainable AI summaries and zero diagnostic black-box scores.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. WHAT IS MINDMITRA (The Problem + Product) */}
      <section className="py-20 px-6 bg-slate-950/60 border-t border-indigo-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              What is MindMitra?
            </h2>
            <p className="text-lg text-indigo-200 font-light">
              Replacing sterile, anxiety-inducing clinical tests with supportive everyday cognitive activities and longitudinal caregiver visibility.
            </p>
          </div>

          {/* 3-Part Product Framing */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="cosmic-card p-8 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-2">Layer 1</span>
                <h3 className="text-2xl font-bold text-white mb-3">Elderly Experience</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Engaging, space-themed constellation activities designed around short memory recall, routine recognition, and familiar photo identification. Built with high-contrast accessibility, large targets, and optional voice assistance.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-indigo-200">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Bilingual (English, Hindi, Telugu)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> No clinical timer pressure</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Supportive positive feedback</li>
              </ul>
            </div>

            <div className="cosmic-card p-8 border border-purple-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block mb-2">Layer 2</span>
                <h3 className="text-2xl font-bold text-white mb-3">Caregiver Dashboard</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  A transparent dashboard layer allowing family members and caregivers to observe performance trends across 4 cognitive domains against the user's personal moving baseline.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-purple-200">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Longitudinal trend progression</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Explainable Gemini AI insights</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Family photo & reminder setup</li>
              </ul>
            </div>

            <div className="cosmic-card p-8 border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">Layer 3</span>
                <h3 className="text-2xl font-bold text-white mb-3">Adaptive AI Engine</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Underneath the hood, a trained Random Forest model processes subtle interaction telemetry (response latency in ms, hesitation variance, self-correction rates) to calibrate difficulty without causing distress.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-cyan-200">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> 5,000+ sample telemetry dataset</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Automatic fallback rules engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Experimental quantum research module</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY MINDMITRA (The Motivation) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 uppercase tracking-wider">
              The Real Problem
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-4 mb-6">
              Cognitive Support is a Continuity Problem, Not a One-Time Test.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
              Caregivers and family members often sense that something has changed with an aging parent or relative -- a slight hesitation during daily tasks or increased difficulty remembering names -- but lack a calm, consistent way to observe changes over time.
            </p>
            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-8">
              MindMitra replaces infrequent clinical check-ups with daily, enjoyable 3-minute activities. By measuring daily engagement variance against an individual's personal moving baseline, MindMitra provides respectful, long-term visibility without causing anxiety or fear.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20">
                <h4 className="text-xl font-bold text-indigo-300">Daily Continuity</h4>
                <p className="text-xs text-slate-400 mt-1">Short regular sessions beat annual snapshots</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20">
                <h4 className="text-xl font-bold text-purple-300">Personal Baseline</h4>
                <p className="text-xs text-slate-400 mt-1">Evaluates user against themselves, not generic norms</p>
              </div>
            </div>
          </div>

          <div className="cosmic-card p-8 border border-indigo-500/30 relative">
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 flex gap-4 items-start">
                <div className="p-2.5 bg-indigo-900/50 rounded-lg text-indigo-300 shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Short-Term Memory</h4>
                  <p className="text-xs text-slate-400">Memory Match card pair retention & response speed</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex gap-4 items-start">
                <div className="p-2.5 bg-emerald-900/50 rounded-lg text-emerald-300 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Sequential Memory</h4>
                  <p className="text-xs text-slate-400">Daily Routine Recall temporal ordering tasks</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 flex gap-4 items-start">
                <div className="p-2.5 bg-amber-900/50 rounded-lg text-amber-300 shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Visual & Person Recognition</h4>
                  <p className="text-xs text-slate-400">Recognizing familiar family faces and objects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STRENGTHS & HONEST LIMITATIONS */}
      <section className="py-20 px-6 bg-slate-950/80 border-t border-indigo-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              System Capabilities & Credible Boundaries
            </h2>
            <p className="text-lg text-indigo-200 font-light">
              Built on transparent engineering guardrails and honest health communication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="cosmic-card p-8 border border-emerald-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle2 size={28} className="text-emerald-400" />
                Key Strengths & Features
              </h3>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Personalized Adaptive Difficulty:</strong> Random Forest model recalibrates challenge levels in real-time to maintain confidence.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Explainable AI Insights:</strong> Translates telemetry deltas into empathetic caregiver summaries without black-box scores.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Multilingual & Speech Support:</strong> Full interface support for English, Hindi, and Telugu with optional TTS audio playback.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Offline-First Architecture:</strong> Telemetry queues locally during connectivity drops and syncs seamlessly when reconnected.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Privacy-First Data Isolation:</strong> Personal photos are stored locally and never sent to external LLM APIs.
                  </div>
                </li>
              </ul>
            </div>

            {/* Honest Limitations */}
            <div className="cosmic-card p-8 border border-amber-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertTriangle size={28} className="text-amber-400" />
                Honest Prototype Limitations
              </h3>

              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Not a Diagnostic Tool:</strong> MindMitra tracks behavioral activity variance; it does NOT certify medical conditions or dementia.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Requires Multi-Session Use:</strong> Reliable moving baselines require at least 3-5 completed sessions over consecutive days.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Simulated Quantum Research Module:</strong> Grover's search and QUBO annealing endpoints run on classical CPU simulators (Qiskit Aer & dimod).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Early-Stage Research Prototype:</strong> Designed as a hackathon submission and research demonstration platform.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (Visual Step Flow) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How MindMitra Works
          </h2>
          <p className="text-lg text-indigo-200 font-light">
            A continuous 5-step loop connecting daily play to caregiver support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="cosmic-card p-6 border border-indigo-500/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-black text-xl mb-4">
              1
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Play</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Elderly user engages in short, 3-minute cognitive games with calm pacing and voice prompts.
            </p>
          </div>

          <div className="cosmic-card p-6 border border-purple-500/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black text-xl mb-4">
              2
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Adapt</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              RandomForest ML model analyzes telemetry (latency, repeat errors) and adjusts difficulty.
            </p>
          </div>

          <div className="cosmic-card p-6 border border-cyan-500/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-xl mb-4">
              3
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Track</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Performance metrics populate a rolling 5-10 session personal moving baseline.
            </p>
          </div>

          <div className="cosmic-card p-6 border border-amber-500/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xl mb-4">
              4
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Explain</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemini AI generates empathetic, natural-language insights for caregivers.
            </p>
          </div>

          <div className="cosmic-card p-6 border border-emerald-500/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-xl mb-4">
              5
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Support</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Caregiver manages family galleries, hydration alerts, and medication schedules.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRUST & CREDIBILITY SECTION */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="cosmic-card p-8 border-2 border-indigo-500/40 bg-slate-950/90 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 bg-indigo-950/80 border border-indigo-400/40 text-indigo-300 rounded-2xl shrink-0">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-2">
                What MindMitra Does NOT Do
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                MindMitra is explicitly designed as a supportive cognitive companion and caregiver observation framework.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-300 flex items-center gap-2">
                  <span>❌</span> No Clinical Diagnosis
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-300 flex items-center gap-2">
                  <span>❌</span> No Medical Claims
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-300 flex items-center gap-2">
                  <span>❌</span> Replaces No Doctor
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-950 border-t border-indigo-500/20 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
                <BrainCircuit size={20} />
              </div>
              <span className="text-xl font-bold text-white">MindMitra</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              AI-powered cognitive companion for elderly users with ML adaptive difficulty, personalized moving baselines, and explainable caregiver insights.
            </p>
            <p className="text-xs text-indigo-300/80">
              Prototype behavioral insight -- not a medical diagnosis.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Platform Routes</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/onboarding" className="hover:text-white">Activity Portal</Link></li>
              <li><Link to="/caregiver" className="hover:text-white">Caregiver Dashboard</Link></li>
              <li><Link to="/methodology" className="hover:text-white">AI Architecture & Methodology</Link></li>
              <li><Link to="/demo" className="hover:text-white">Interactive Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Caregiver Auth</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/auth/login" className="hover:text-white">Caregiver Login</Link></li>
              <li><Link to="/auth/signup" className="hover:text-white">Create Caregiver Account</Link></li>
              <li><Link to="/auth/forgot-password" className="hover:text-white">Reset Password (OTP)</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 MindMitra Platform. Built for elderly care and research.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link to="/methodology" className="hover:text-slate-400">Privacy Notice</Link>
            <Link to="/methodology" className="hover:text-slate-400">Terms of Care</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
