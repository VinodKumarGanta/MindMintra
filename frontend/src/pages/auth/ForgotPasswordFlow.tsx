import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, RefreshCw, XCircle, ShieldCheck, User } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordFlow() {
  const navigate = useNavigate();

  // Steps: 1 = Email Input, 2 = OTP Input, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Countdown Timer (60s)
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Password requirements for step 3 (min 4 chars)
  const reqMinLength = newPassword.length >= 4;
  const isPasswordValid = reqMinLength;

  const validateEmail = (val: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val.trim());
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid registered Username (Email ID).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword({ email: cleanEmail });
      if (res.demo_otp_code) {
        setDemoOtpHint(res.demo_otp_code);
      }
      setSuccessMessage('A 6-digit verification code has been sent to your email.');
      setStep(2);
      setTimerSeconds(60);
      setTimerActive(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOTP = async () => {
    if (timerActive) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email: email.trim() });
      if (res.demo_otp_code) {
        setDemoOtpHint(res.demo_otp_code);
      }
      setSuccessMessage('A new 6-digit OTP code has been sent.');
      setTimerSeconds(60);
      setTimerActive(true);
    } catch (err: any) {
      setErrorMessage('Could not resend OTP code. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setErrorMessage('Please enter a valid 6-digit numeric OTP code.');
      return;
    }

    setLoading(true);
    try {
      await api.verifyOTP({ email: email.trim(), otp_code: cleanOtp });
      setSuccessMessage('OTP verified! Please set your new password.');
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email: email.trim(),
        otp_code: otpCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Try requesting a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative z-10 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Link */}
      <button
        onClick={() => navigate('/auth/login')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/80 border border-indigo-500/20 rounded-xl text-sm font-medium transition-all"
      >
        <ArrowLeft size={18} />
        Back to Login
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md my-12"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Caretaker Password Recovery</h1>
          <p className="text-sm text-slate-400 mt-1">Change or reset your caretaker password with OTP verification</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: ENTER USERNAME / EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <p className="text-sm text-slate-300">
                Enter your registered Username (Email ID). We will generate a 6-digit verification code.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send OTP Verification Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: ENTER OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200">
                <span>Code sent to <strong>{email}</strong> (valid for 10 minutes).</span>
                {demoOtpHint && (
                  <div className="mt-2 p-2 bg-slate-900 border border-indigo-400/40 rounded-xl text-amber-300 font-mono font-bold text-center">
                    Demo OTP Code: {demoOtpHint}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full py-4 text-center font-mono text-3xl tracking-[0.5em] bg-slate-950 border border-indigo-500/40 focus:border-indigo-400 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {timerActive ? `Resend in ${timerSeconds}s` : 'Did not receive code?'}
                </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={timerActive || loading}
                  className={`font-semibold flex items-center gap-1 ${
                    timerActive ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'
                  }`}
                >
                  <RefreshCw size={12} /> Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Verify OTP Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={16} /> OTP Code Verified! Set your new password below.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password (Letters, numbers)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 characters)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base"
                    required
                  />
                </div>

                {newPassword.length > 0 && (
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base"
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
                  <span>Reset & Update Password</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                <ShieldCheck size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white">Password Reset Complete!</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your caretaker account password has been updated securely. You can now log in using your new credentials.
              </p>

              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Proceed to Caretaker Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Remember your password?{' '}
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

