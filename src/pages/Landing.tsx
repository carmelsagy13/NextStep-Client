import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'AI-Powered Analysis',
    description: 'Upload your Open Finance data and get an instant, personalised financial snapshot.',
  },
  {
    icon: TrendingUp,
    title: 'Your Financial Roadmap',
    description: 'Receive a step-by-step roadmap guiding you from financial stability to freedom.',
  },
  {
    icon: ShieldCheck,
    title: 'Goal Tracking',
    description: 'Set and track meaningful financial goals with real-time progress updates.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 flex flex-col">
      {/* Nav */}
      <header className="mx-auto w-full max-w-5xl px-6 pt-6 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-violet-600 dark:text-violet-400">
          NextStep
        </span>
        <Link
          to="/login"
          className="rounded-xl border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-sm transition
            hover:bg-violet-50 dark:border-violet-700 dark:bg-gray-900 dark:text-violet-400 dark:hover:bg-violet-950/30"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-xl shadow-violet-200 dark:shadow-violet-900/40 mb-6">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 max-w-2xl leading-tight">
          Your path to{' '}
          <span className="text-violet-600 dark:text-violet-400">financial freedom</span>{' '}
          starts here
        </h1>

        <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          NextStep analyses your financial data to build a personalised roadmap and help you
          reach your goals — one step at a time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40 transition
              hover:bg-violet-700 active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 mb-3">
                <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="pb-8 text-center text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} NextStep. All rights reserved.
      </footer>
    </div>
  );
}
