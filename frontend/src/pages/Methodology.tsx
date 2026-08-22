import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Settings, ShieldCheck, Database, LayoutDashboard, CloudOff, ArrowLeft, Sparkles, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 pb-24 relative z-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20"
          >
            <ArrowLeft size={20} /> Back to Welcome
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Architecture & AI Methodology
          </h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto font-light">
            "Exploring the mind like exploring a universe" — Combining engineered healthcare guardrails with adaptive machine learning.
          </p>
        </header>

        {/* 4 Cognitive Games Mapping Banner */}
        <div className="cosmic-card p-6 mb-10 border border-indigo-500/30">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            4 Core Cognitive Activities (MVP Specification)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">🧠</div>
              <h3 className="font-bold text-white text-base">1. Memory Match</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Short-Term Memory</p>
              <p className="text-xs text-slate-400 mt-1">Evaluates card pair retention, latency, and repeat mistake rates.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">📋</div>
              <h3 className="font-bold text-white text-base">2. Daily Routine Recall</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Sequential Memory</p>
              <p className="text-xs text-slate-400 mt-1">Memorize-and-recall sequence task measuring temporal ordering.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">🔍</div>
              <h3 className="font-bold text-white text-base">3. Object & Person Recognition</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Visual & Person Recognition</p>
              <p className="text-xs text-slate-400 mt-1">Label-free visual identification and familiar caregiver photos.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">✨</div>
              <h3 className="font-bold text-white text-base">4. Pattern Recall</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Pattern & Attention</p>
              <p className="text-xs text-slate-400 mt-1">Constellation structure recognition with distractor patterns.</p>
            </div>
          </div>
        </div>

        {/* AI/ML vs Engineered Architecture */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI / Machine Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-card p-8 border border-purple-500/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-purple-950/80 border border-purple-400/40 text-purple-300 rounded-2xl">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI & Machine Learning</h2>
                <p className="text-sm text-purple-200">Adaptive Intelligence & Explainability</p>
              </div>
            </div>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Adaptive Difficulty Engine (Random Forest)</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    A multi-class classifier trained on 5,000+ telemetry vectors analyzes response latency, error variance, and accuracy to adjust challenge levels (Level 1–4) without user frustration.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Fine-Grained Behavioral Telemetry</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Extracts subtle interaction metrics beyond pure score: reaction latency (ms), hesitation time, repeat confusion, and self-correction attempts.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Empathetic Caregiver Explainability (Gemini)</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Converts statistical telemetry deltas into clear, compassionate caregiver insights without sending sensitive personal photos to external LLM APIs.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Engineered Systems Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="cosmic-card p-8 border border-blue-500/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-950/80 border border-blue-400/40 text-blue-300 rounded-2xl">
                <Settings size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Engineered Systems</h2>
                <p className="text-sm text-blue-200">Clinical Guardrails & Accessibility</p>
              </div>
            </div>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <ShieldCheck className="text-emerald-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Moving Baseline Engine</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Calculates rolling averages over 5–10 historical sessions. Strictly prevents clinical diagnostic claims while highlighting meaningful deviations for caregiver awareness.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <LayoutDashboard className="text-blue-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Inclusive Elderly-First UX</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Large 48px+ touch targets, 18px+ base typography, calm animations, bilingual (English & Hindi) dictionaries, and optional speech synthesis.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <CloudOff className="text-indigo-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Offline-First Local Storage</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Client-side persistence queues telemetry during connectivity interruptions, maintaining seamless gameplay and synchronization.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Quantum Research Module Interactive Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="cosmic-card p-8 mt-10 border border-cyan-500/40 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 rounded-2xl">
                <Sparkles size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Quantum Research Module
                  <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                    Experimental Demo
                  </span>
                </h2>
                <p className="text-sm text-cyan-200">
                  Exploratory quantum computing algorithms (Grover Search & QUBO Annealing) simulated via Qiskit & dimod.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Grover Search Interactive Card */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base">1. Grover's Algorithm Search</h3>
                  <span className="text-xs text-cyan-400 font-mono">Qiskit AerSimulator</span>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Constructs a 2-qubit phase-kickback oracle and Grover diffuser ($H^{\otimes n} (2|0\rangle\langle0| - I) H^{\otimes n}$) to locate target accuracy difficulty level.
                </p>

                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-1">Target Accuracy Seeking:</label>
                  <select
                    id="grover-target-select"
                    className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="0.90">90% (Level 1)</option>
                    <option value="0.78">78% (Level 2)</option>
                    <option value="0.65">65% (Level 3)</option>
                    <option value="0.50">50% (Level 4)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={async () => {
                  const sel = document.getElementById('grover-target-select') as HTMLSelectElement;
                  const val = parseFloat(sel?.value || '0.75');
                  const resultElem = document.getElementById('grover-result-box');
                  if (resultElem) resultElem.innerText = 'Running Grover quantum circuit...';
                  try {
                    const res = await fetch(`/quantum/grover-difficulty-search?target_accuracy=${val}`);
                    const data = await res.json();
                    if (resultElem) {
                      resultElem.innerText = `Recommended Level: Level ${data.result?.recommended_difficulty_level}\n` +
                        `Probability: ${(data.result?.grover_probability * 100).toFixed(1)}%\n` +
                        `Classical Verification Match: ${data.classical_verification?.match ? 'EXACT MATCH (100%)' : 'Mismatch'}\n` +
                        `Qubits: ${data.result?.qubits_used} | Iterations: ${data.result?.grover_iterations}`;
                    }
                  } catch (e: any) {
                    if (resultElem) resultElem.innerText = `Error: ${e.message}`;
                  }
                }}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-cyan-600/20"
              >
                Run Grover Quantum Circuit Demo
              </button>

              <div id="grover-result-box" className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-cyan-200 min-h-[60px] whitespace-pre-wrap">
                Click button to run live Grover search.
              </div>
            </div>

            {/* QUBO Annealing Interactive Card */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-purple-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base">2. QUBO Annealing Scheduler</h3>
                  <span className="text-xs text-purple-400 font-mono">dimod SA Sampler</span>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Formulates a 16-variable QUBO matrix balancing user engagement ($\alpha$) vs. frustration ($\beta$) across all 4 cognitive games simultaneously.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Engagement ($\alpha$): 0.6</label>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Frustration ($\beta$): 0.4</label>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  const resultElem = document.getElementById('qubo-result-box');
                  if (resultElem) resultElem.innerText = 'Sampling QUBO energy landscape...';
                  try {
                    const res = await fetch('/quantum/annealing-schedule-optimizer?alpha=0.6&beta=0.4');
                    const data = await res.json();
                    if (resultElem) {
                      const recs = data.result?.recommended_difficulty_levels || {};
                      resultElem.innerText = `Optimal Schedule:\n` +
                        `• Memory Match: Level ${recs.memory_match}\n` +
                        `• Daily Routine: Level ${recs.daily_routine}\n` +
                        `• Object Recognition: Level ${recs.object_recognition}\n` +
                        `• Pattern Recall: Level ${recs.pattern_recall}\n` +
                        `Energy: ${data.result?.qubo_energy} | Reads: ${data.result?.num_annealing_reads}`;
                    }
                  } catch (e: any) {
                    if (resultElem) resultElem.innerText = `Error: ${e.message}`;
                  }
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20"
              >
                Run QUBO Annealing Optimizer
              </button>

              <div id="qubo-result-box" className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-purple-200 min-h-[60px] whitespace-pre-wrap">
                Click button to run QUBO annealing schedule.
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            * <strong>Honest Disclaimer:</strong> Runs on classical CPU simulators (Qiskit Aer & dimod SA). Fully isolated from the production Random Forest adaptive difficulty pipeline in <code className="text-indigo-300">backend/main.py</code>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

