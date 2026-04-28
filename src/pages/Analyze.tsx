import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRoadmapStore } from '../store/roadmapStore';
import FinancialReportUpload from '../components/FinancialReportUpload';
import RoadmapCard from '../components/RoadmapCard';
import GoalList from '../components/GoalList';
import { getRoadmap } from '../api/roadmap.api';
import { getGoals } from '../api/goals.api';
import { getProfile } from '../api/profile.api';
import type { RoadmapState, UserGoal } from '../types';

export default function Analyze() {
  const navigate = useNavigate();
  const { accessToken, clearAuth } = useAuthStore();
  const { hydrate, reset, roadmapState, goals } = useRoadmapStore();

  const [pageStatus, setPageStatus] = useState<'loading' | 'ready'>('loading');
  const [showUpload, setShowUpload] = useState(false);

  // Guard: redirect unauthenticated users to login
  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true });
    }
  }, [accessToken, navigate]);

  // Initial data load: fetch existing roadmap + goals from DB
  useEffect(() => {
    if (!accessToken) return;

    async function loadData() {
      try {
        // Check profile first — a 404 means the profile was deleted.
        // Clear all stale local state and show the onboarding upload form.
        await getProfile();
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) {
          reset();
          setShowUpload(true);
          setPageStatus('ready');
          return;
        }
        // For non-404 profile errors fall through so the user isn't locked out.
      }

      try {
        const [roadmapRes, goalsRes] = await Promise.all([getRoadmap(), getGoals()]);
        const loadedState: RoadmapState | null = roadmapRes.data?.state ?? null;
        const loadedGoals: UserGoal[] = Array.isArray(goalsRes.data) ? goalsRes.data : [];
        hydrate(loadedState, loadedGoals);
        const hasData = !!loadedState || loadedGoals.length > 0;
        setShowUpload(!hasData);
      } catch {
        // No data yet — show the upload form
        setShowUpload(true);
      } finally {
        setPageStatus('ready');
      }
    }

    loadData();
  }, [accessToken, hydrate, reset]);

  const handleLogout = () => {
    clearAuth();
    reset();
    navigate('/login', { replace: true });
  };

  if (!accessToken) return null;

  // Full-screen loading spinner while fetching initial data
  if (pageStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const hasData = !!roadmapState || (goals && goals.length > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="text-sm font-bold tracking-tight text-black dark:text-white">
            NextStep
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition
              hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        {/* Header + Re-analyze toggle */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Financial Analysis
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasData
                ? 'Your personalised roadmap and goals are shown below.'
                : 'Upload your Open Finance report to generate your personalised roadmap and goals.'}
            </p>
          </div>

          {/* Only show the toggle when data already exists */}
          {hasData && (
            <button
              type="button"
              onClick={() => setShowUpload((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-black transition
                hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Re-analyze
              {showUpload ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {/* Upload section — always shown when no data, collapsible when data exists */}
        {showUpload && (
          <FinancialReportUpload onSuccess={() => setShowUpload(false)} />
        )}

        {/* Roadmap + Goals — shown as soon as data is available */}
        <RoadmapCard />
        <GoalList />
      </main>
    </div>
  );
}
