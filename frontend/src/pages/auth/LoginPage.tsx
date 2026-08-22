import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, User, Lock, LogIn, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAppContext();


  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = usernameEmail.trim();
    if (!cleanUsername) {
      setErrorMessage('Please enter your Username (Email ID).');
      return;
    }
    if (!validateEmail(cleanUsername)) {
      setErrorMessage('Please enter a valid Username / Email (e.g. caretaker@example.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginCaregiver({ email: cleanUsername, password });
      setSuccessMessage('Login successful! Redirecting...');
      
      if (res.user) {
        localStorage.setItem('mindmitra_caregiver_token', res.token || 'demo_token');
        localStorage.setItem('mindmitra_caregiver_user', JSON.stringify(res.user));
      }

      // Redirect to ?next= page or default to Home Landing page
      const params = new URLSearchParams(location.search);
      const nextPage = params.get('next') || '/';

      setTimeout(() => {
        navigate(nextPage);
      }, 1000);


    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Username (Email ID) or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative z-10 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/80 border border-indigo-500/20 rounded-xl text-sm font-medium transition-all"
      >
        <ArrowLeft size={18} />
        Back to MindMitra
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mx-auto mb-4">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Caretaker / Caregiver Login</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with your registered Username and Password</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username (User Email ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={usernameEmail}
                  onChange={(e) => setUsernameEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password (Letters, numbers)
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <KeyRound size={13} />
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Log In as Caretaker</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col gap-2.5 text-center">
            <p className="text-sm text-slate-400">
              New caretaker?{' '}
              <Link to="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
                Create an account
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Want to change password?{' '}
              <Link to="/auth/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">
                Reset / Change Password
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

