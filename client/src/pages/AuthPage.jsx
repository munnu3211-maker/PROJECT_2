import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { useUser } from '../context/UserContext';
import { authRegister, authLogin, authGoogle } from '../services/api';
import toast from 'react-hot-toast';
import { trackLogin } from '../utils/analytics';
import {
  FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiShield
} from 'react-icons/fi';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        if (!form.name || !form.email || !form.password) {
          toast.error('Please fill in all fields.');
          setLoading(false);
          return;
        }
        res = await authRegister(form);
        toast.success('Account created! 🎉');
      } else {
        if (!form.email || !form.password) {
          toast.error('Please fill in email and password.');
          setLoading(false);
          return;
        }
        res = await authLogin({ email: form.email, password: form.password });
        toast.success('Welcome back! 🗳️');
      }

      const { user, token } = res.data.data;
      loginUser(user, token);
      trackLogin(mode === 'register' ? 'email_register' : 'email_login');
      navigate(user.profileCompleted ? '/dashboard' : '/setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Guard: check if Firebase is configured
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      toast.error('Google Sign-In is not configured. Please use email/password to sign in.');
      return;
    }

    setGoogleLoading(true);
    try {
      // Firebase Google popup sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send Firebase ID token to our backend
      const res = await authGoogle(idToken);
      const { user, token } = res.data.data;
      loginUser(user, token);
      toast.success(`Welcome, ${user.name}! 🎉`);
      trackLogin('google');
      navigate(user.profileCompleted ? '/dashboard' : '/setup');
    } catch (err) {
      // Handle specific Firebase errors
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in popup was closed.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore — duplicate popup
      } else if (err.code === 'auth/api-key-not-valid') {
        toast.error('Firebase API key is invalid. Please check your configuration.');
      } else {
        toast.error(err.response?.data?.error || err.message || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark relative overflow-hidden flex items-center justify-center px-4 py-8" role="main" id="main-content">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4 text-2xl shadow-xl shadow-primary/20">
            🗳️
          </div>
          <h1 className="text-2xl font-bold gradient-text">VotePath AI</h1>
          <p className="text-text-muted text-sm mt-1">Election Journey Assistant</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="p-7">
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-bg-elevated p-1 mb-6" role="tablist" aria-label="Authentication mode">
              {['login', 'register'].map((tab) => (
                <button key={tab} onClick={() => setMode(tab)}
                  role="tab"
                  aria-selected={mode === tab}
                  aria-controls="auth-form"
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === tab
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-text-muted hover:text-text-primary'
                    }`}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Google Sign-In Button (Firebase) */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || !isFirebaseConfigured}
              whileHover={{ scale: isFirebaseConfigured ? 1.01 : 1 }}
              whileTap={{ scale: isFirebaseConfigured ? 0.98 : 1 }}
              className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border transition-all text-sm font-medium mb-5 ${isFirebaseConfigured
                  ? 'bg-bg-elevated border-border hover:border-primary/30 text-text-primary disabled:opacity-60 disabled:cursor-not-allowed'
                  : 'bg-bg-elevated/50 border-border/50 text-text-muted/50 cursor-not-allowed'
                }`}
              title={!isFirebaseConfigured ? 'Google Sign-In requires Firebase configuration in client/.env' : ''}
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-text-muted/30 border-t-text-primary rounded-full animate-spin" />
              ) : (
                <svg className={`w-5 h-5 ${!isFirebaseConfigured ? 'opacity-40' : ''}`} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {googleLoading
                ? 'Signing in...'
                : !isFirebaseConfigured
                  ? 'Google Sign-In (Not Configured)'
                  : mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-muted text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="auth-form" aria-label={mode === 'login' ? 'Sign in form' : 'Registration form'}>
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div key="name-field"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="auth-name" className="block text-xs text-text-secondary mb-1.5 font-medium">
                      <FiUser className="inline mr-1" size={12} /> Full Name
                    </label>
                    <input id="auth-name" type="text" className="input-field" placeholder="Enter your full name"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      aria-required="true" autoComplete="name" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="auth-email" className="block text-xs text-text-secondary mb-1.5 font-medium">
                  <FiMail className="inline mr-1" size={12} /> Email Address
                </label>
                <input id="auth-email" type="email" className="input-field" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  aria-required="true" autoComplete="email" />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs text-text-secondary mb-1.5 font-medium">
                  <FiLock className="inline mr-1" size={12} /> Password
                </label>
                <div className="relative">
                  <input id="auth-password" type={showPw ? 'text' : 'password'} className="input-field pr-10"
                    placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    aria-required="true"
                    aria-describedby={mode === 'register' ? 'password-hint' : undefined}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {mode === 'register' && <p id="password-hint" className="sr-only">Password must be at least 6 characters</p>}
              </div>

              <motion.button type="submit" disabled={loading}
                className="btn-primary w-full py-3 mt-2 shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === 'login' ? 'Sign In' : 'Create Account'} <FiArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>

            {/* Switch mode text */}
            <p className="text-center text-xs text-text-muted mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary hover:underline font-medium">
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-3 mt-6 text-text-muted text-xs">
          <FiShield size={12} className="text-secondary" />
          <span>Your data is encrypted and never shared</span>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-text-muted text-[10px]">
          <span>🇮🇳 Made for India</span>
          <span>•</span>
          <span>🔒 Non-Political</span>
          <span>•</span>
          <span>📋 ECI-Based</span>
        </div>
      </motion.div>
    </div>
  );
}
