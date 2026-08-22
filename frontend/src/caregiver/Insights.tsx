import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Brain, ListOrdered, Eye, Sparkles, AlertCircle, Loader2, Users, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { User, CognitiveDomain } from '../types';
import { motion } from 'framer-motion';

const DOMAIN_ICONS: Record<string, string> = {
  short_term_memory: '🧠',
  sequential_reasoning: '📋',
  visual_recognition: '🔍',
  pattern_recognition: '✨',
};

const DOMAIN_LABELS: Record<string, string> = {
  short_term_memory: 'Short-Term Memory',
  sequential_reasoning: 'Sequential Memory',
  visual_recognition: 'Visual Recognition',
  pattern_recognition: 'Pattern Recognition & Attention',
};

const STATUS_BADGES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  stable: { color: 'text-indigo-300', bg: 'bg-indigo-950/60', border: 'border-indigo-500/30', label: 'Stable' },
  improving: { color: 'text-emerald-300', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', label: 'Improving' },
  recent_change: { color: 'text-amber-300', bg: 'bg-amber-950/60', border: 'border-amber-500/40', label: 'Recent Change' },
  variable: { color: 'text-purple-300', bg: 'bg-purple-950/60', border: 'border-purple-500/40', label: 'Variable' },
  insufficient_data: { color: 'text-slate-400', bg: 'bg-slate-900/60', border: 'border-slate-700', label: 'Insufficient Data' },
};

export default function Insights() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [domains, setDomains] = useState<CognitiveDomain[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const allUsers = await api.getUsers();
        const unique = Array.from(new Map(allUsers.map(item => [item.display_name, item])).values());
        setUsers(unique);
        if (unique.length > 0) setSelectedUserId(unique[0].id);
      } catch {}
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    async function loadDomains() {
      setLoading(true);
      try {
        const d = await api.getCognitiveDomains(selectedUserId!);
        setDomains(d);

        // Load pre-generated explanations
        const insights = await api.getAllInsights(selectedUserId!);
        const expMap: Record<string, string> = {};
        for (const ins of insights) {
          expMap[ins.domain] = ins.insight;
        }
        setExplanations(expMap);
      } catch (err) {
        console.log('Could not load insights');
      }
      setLoading(false);
    }
    loadDomains();
  }, [selectedUserId]);

  const generateExplanation = async (domain: string, status: string, analytics: any) => {
    setLoadingExplanation(domain);
    try {
      const evidence = `Current accuracy: ${((analytics.current_performance || 0) * 100).toFixed(0)}%, Personal baseline: ${((analytics.baseline || 0) * 100).toFixed(0)}%, Accuracy delta: ${((analytics.deviation || 0) * 100).toFixed(1)}%`;
      const result = await api.explainInsight(domain, status, evidence);
      setExplanations(prev => ({ ...prev, [domain]: result.explanation }));
    } catch {
      setExplanations(prev => ({
        ...prev,
        [domain]: `Over recent sessions, ${DOMAIN_LABELS[domain] || domain} performance shows ${status.replace('_', ' ')}. This observation reflects normal engagement variance. Prototype behavioral insight — not a medical diagnosis.`,
      }));
    }
    setLoadingExplanation(null);
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Explainable AI Insights</h1>
        </div>

        {users.length > 0 && (
          <div className="flex items-center gap-3">
            <Users size={18} className="text-indigo-400" />
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="p-2 px-4 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white text-base focus:border-indigo-400 focus:outline-none"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.display_name} (Age {u.age})
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-indigo-500/20 pb-2 overflow-x-auto">
          <Link to="/caregiver" className="text-lg font-medium text-slate-400 hover:text-white px-4 pb-2 whitespace-nowrap">
            Overview
          </Link>
          <Link to="/caregiver/trends" className="text-lg font-medium text-slate-400 hover:text-white px-4 pb-2 whitespace-nowrap">
            Longitudinal Trends & Adaptive AI
          </Link>
          <Link to="/caregiver/insights" className="text-lg font-semibold text-indigo-300 border-b-2 border-indigo-400 pb-2 px-4 whitespace-nowrap">
            Explainable AI Insights
          </Link>
          <Link to="/caregiver/people" className="text-lg font-medium text-slate-400 hover:text-white px-4 pb-2 whitespace-nowrap">
            Familiar People
          </Link>
          <Link to="/caregiver/reminders" className="text-lg font-medium text-slate-400 hover:text-white px-4 pb-2 whitespace-nowrap">
            Reminders & Schedule
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <span className="ml-3 text-xl text-slate-300">Analyzing structured observations...</span>
          </div>
        ) : domains.length === 0 ? (
          <div className="cosmic-card p-12 text-center text-slate-400 text-xl">
            No cognitive domain data available yet. Complete daily sessions to see insights.
          </div>
        ) : (
          domains.map((d, idx) => {
            const analytics = d.analytics;
            const trend = analytics.trend;
            const badge = STATUS_BADGES[trend] || STATUS_BADGES.insufficient_data;
            const explanation = explanations[d.domain];
            const isHighlighted = trend === 'recent_change' || trend === 'variable';

            return (
              <motion.div
                key={d.domain}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`cosmic-card overflow-hidden border-2 ${
                  isHighlighted ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-indigo-500/30'
                }`}
              >
                {/* Header */}
                <div className={`p-5 flex items-center justify-between border-b ${
                  isHighlighted ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-900/40 border-indigo-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{DOMAIN_ICONS[d.domain] || '📊'}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{DOMAIN_LABELS[d.domain] || d.domain}</h3>
                      <p className="text-xs text-slate-400">Cognitive domain behavioral telemetry</p>
                    </div>
                  </div>

                  <span className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.border} ${badge.bg} ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Evidence Body */}
                <div className="p-6">
                  {trend !== 'insufficient_data' ? (
                    <>
                      {isHighlighted && (
                        <div className="mb-6 p-5 bg-amber-950/40 rounded-2xl border border-amber-500/40">
                          <h4 className="font-bold text-amber-300 mb-3 flex items-center gap-2 text-base">
                            <AlertCircle size={20} /> WHY THIS WAS HIGHLIGHTED
                          </h4>
                          <div className="space-y-1.5 text-sm text-slate-200">
                            <p><strong>Observed Evidence:</strong> Accuracy delta of {((analytics.deviation || 0) * 100).toFixed(1)}% compared to established personal baseline.</p>
                            <p><strong>Latency Telemetry:</strong> Average response time changed by {((analytics.latency_deviation_ms || 0)/1000).toFixed(1)}s.</p>
                            <p><strong>Longitudinal Pattern:</strong> Observed across recent demonstration sessions.</p>
                            <p><strong>Behavioral Interpretation:</strong> Recent performance differs from user's established historical comfort baseline.</p>
                            <p><strong>Caregiver Action:</strong> Continue monitoring trends. If persistent questions arise, discuss with a qualified healthcare professional.</p>
                          </div>
                        </div>
                      )}

                      {/* Stat Metrics Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Current Performance</p>
                          <p className="text-2xl font-bold text-white">{((analytics.current_performance || 0) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Personal Baseline</p>
                          <p className="text-2xl font-bold text-indigo-300">{((analytics.baseline || 0) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Baseline Deviation</p>
                          <p className={`text-2xl font-bold ${(analytics.deviation || 0) < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {((analytics.deviation || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* AI Caregiver Explanation */}
                      <div className="bg-indigo-950/40 rounded-2xl p-5 border border-indigo-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={18} className="text-indigo-300" />
                          <h4 className="font-bold text-indigo-200 text-sm">Gemini AI Caregiver Summary</h4>
                        </div>

                        {explanation ? (
                          <p className="text-slate-200 text-base leading-relaxed">{explanation}</p>
                        ) : loadingExplanation === d.domain ? (
                          <div className="flex items-center gap-2 text-indigo-300 py-2">
                            <Loader2 size={18} className="animate-spin" />
                            Synthesizing caregiver explanation...
                          </div>
                        ) : (
                          <button
                            onClick={() => generateExplanation(d.domain, trend, analytics)}
                            className="text-indigo-300 hover:text-indigo-100 font-semibold text-sm underline flex items-center gap-1.5 py-1"
                          >
                            <span>✨</span> Generate Natural AI Explanation →
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 text-center py-4">
                      Collecting sessions to establish a reliable personal baseline.
                    </p>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="px-6 pb-4">
                  <p className="text-xs text-slate-400/80 italic flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-indigo-400" />
                    Prototype behavioral insight — not a medical diagnosis.
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
