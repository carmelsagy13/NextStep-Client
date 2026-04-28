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
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Nav */}
      <header className="mx-auto w-full max-w-5xl px-6 pt-6 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-black dark:text-white">
          NextStep
        </span>
        <Link
          to="/login"
          className="rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black transition
            hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-black mb-6">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white max-w-2xl leading-tight">
          Your path to{' '}
          <span className="text-black dark:text-white">financial freedom</span>{' '}
          starts here
        </h1>

        <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          NextStep analyses your financial data to build a personalised roadmap and help you
          reach your goals — one step at a time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-sm bg-black px-7 py-3 text-sm font-bold text-white transition
              hover:bg-gray-900 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-100"
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
              className="rounded-sm border border-gray-200 bg-white px-5 py-5 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gray-100 dark:bg-gray-800 mb-3">
                <Icon className="h-5 w-5 text-black dark:text-white" />
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
