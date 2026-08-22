import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, User, UserPlus, ArrowLeft, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simple, flexible password requirements (min 4 characters, letters/numbers)
  const reqMinLength = password.length >= 4;
  const isPasswordValid = reqMinLength;

  const validateEmail = (val: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid Username / Email address.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password field.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signupCaregiver({
        full_name: fullName.trim(),
        email: cleanEmail,
        password,
        confirm_password: confirmPassword,
      });

      setSuccessMessage('Account created successfully! Redirecting to caretaker dashboard...');
      if (res.user) {
        localStorage.setItem('mindmitra_caregiver_token', res.token || 'demo_token');
        localStorage.setItem('mindmitra_caregiver_user', JSON.stringify(res.user));
      }

      setTimeout(() => {
        navigate('/');
      }, 1200);

    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please check your details.');
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
        className="w-full max-w-md my-12"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mx-auto mb-4">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Caretaker / Caregiver Sign Up</h1>
          <p className="text-sm text-slate-400 mt-1">Create an account to track cognitive progression and insights</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email ID
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password (Letters, numbers)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (letters, numbers)"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                  required
                />
              </div>

              {/* Password Requirement Info */}
              {password.length > 0 && (
                <div className="mt-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${reqMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {reqMinLength ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>Minimum 4 characters (letters, numbers)</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-950 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-base transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-500/60 focus:ring-rose-500/20'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  required
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-rose-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-base mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Caretaker Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

