import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { useTranslation } from './i18n';
import { Home, Activity, Brain, WifiOff, Sparkles, Users, Play } from 'lucide-react';

import SpaceBackground from './components/SpaceBackground';
import CustomCursor from './components/CustomCursor';
import TTSDebugPanel from './components/TTSDebugPanel';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Session = lazy(() => import('./pages/Session'));
const GamePage = lazy(() => import('./pages/GamePage'));
const SessionComplete = lazy(() => import('./pages/SessionComplete'));
const CaregiverDashboard = lazy(() => import('./caregiver/Dashboard'));
const CaregiverTrends = lazy(() => import('./caregiver/Trends'));
const CaregiverInsights = lazy(() => import('./caregiver/Insights'));
const CaregiverFamiliarPeople = lazy(() => import('./caregiver/FamiliarPeople'));
const CaregiverReminders = lazy(() => import('./caregiver/Reminders'));
const Methodology = lazy(() => import('./pages/Methodology'));
const Demo = lazy(() => import('./pages/Demo'));

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordFlow = lazy(() => import('./pages/auth/ForgotPasswordFlow'));

const OfflineBanner = () => {
  const { isOnline } = useAppContext();
  if (isOnline) return null;
  return (
    <div className="bg-amber-600/90 backdrop-blur-md text-white p-3 text-center flex items-center justify-center gap-2 sticky top-0 z-50 text-base font-semibold shadow-lg">
      <WifiOff size={20} />
      <span>Offline Mode Active — Telemetry & gameplay saved locally</span>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex-grow flex flex-col items-center justify-center p-8 gap-4 min-h-[50vh]">
    <div className="w-14 h-14 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
    <span className="text-xl text-indigo-200 font-medium">Exploring cognitive space...</span>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/games/');
  const isAuthRoute = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background space/cognitive exploration environment */}
      <SpaceBackground />

      {/* Interactive custom celestial pointer on desktop */}
      <CustomCursor />

      {/* Offline Status */}
      <OfflineBanner />

      {/* Main Page Routing */}
      <main className="flex-grow flex flex-col relative z-10">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/session" element={<Session />} />
            <Route path="/games/:gameType" element={<GamePage />} />
            <Route path="/session/complete" element={<SessionComplete />} />
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route path="/caregiver/trends" element={<CaregiverTrends />} />
            <Route path="/caregiver/insights" element={<CaregiverInsights />} />
            <Route path="/caregiver/people" element={<CaregiverFamiliarPeople />} />
            <Route path="/caregiver/reminders" element={<CaregiverReminders />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/demo" element={<Demo />} />

            {/* Caregiver Authentication Flow */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordFlow />} />
          </Routes>
        </Suspense>
      </main>

      {/* Multilingual TTS Debugger & Voice Inspector Panel */}
      <TTSDebugPanel />

      {/* Bottom Nav: Displayed on high-level pages, hidden during game sessions & auth */}
      {!isGameRoute && !isAuthRoute && (
        <nav className="bg-slate-950/80 backdrop-blur-xl border-t border-indigo-500/20 py-2.5 px-4 sticky bottom-0 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
          <div className="max-w-3xl mx-auto flex justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname === '/' ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home size={22} />
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>

            <Link
              to="/welcome"
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname === '/welcome' || location.pathname === '/onboarding' || location.pathname.startsWith('/session') || location.pathname.startsWith('/games')
                  ? 'text-indigo-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play size={22} className="text-emerald-400" />
              <span className="text-xs mt-1 font-semibold text-emerald-300">Cognitive Session</span>
            </Link>

            <Link
              to="/caregiver"
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname.startsWith('/caregiver') ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={22} />
              <span className="text-xs mt-1 font-medium">Caregiver</span>
            </Link>

            <Link
              to="/methodology"
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname === '/methodology' ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain size={22} />
              <span className="text-xs mt-1 font-medium">Methodology</span>
            </Link>

            <Link
              to="/demo"
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname === '/demo' ? 'text-purple-300' : 'text-slate-400 hover:text-purple-200'
              }`}
            >
              <Sparkles size={22} />
              <span className="text-xs mt-1 font-medium">Demo</span>
            </Link>

          </div>
        </nav>
      )}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
