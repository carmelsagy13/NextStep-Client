import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await login(email.trim(), password);
      const { accessToken, userId } = data as AuthResponse;
      setAuth(accessToken, userId);
      navigate('/analyze');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      const status = axiosErr.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid email or password.');
      } else {
        setError(
          axiosErr.response?.data?.message ?? 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/40 mb-4">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your NextStep account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100/60 dark:border-gray-700 dark:bg-gray-900 dark:shadow-gray-950/60 px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                  shadow-sm transition
                  focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20
                  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
                  dark:focus:border-violet-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400
                    shadow-sm transition
                    focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20
                    dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
                    dark:focus:border-violet-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-800 dark:bg-red-950/30">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                transition-all hover:bg-violet-700 active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Link to register */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
