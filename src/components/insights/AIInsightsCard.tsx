'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  PiggyBank,
  Shield,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  saving_tip: <PiggyBank size={18} />,
  spending_alert: <AlertTriangle size={18} />,
  income_opportunity: <TrendingUp size={18} />,
  budget_advice: <Target size={18} />,
  trend_warning: <TrendingDown size={18} />,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  saving_tip: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  spending_alert: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  income_opportunity: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  budget_advice: { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  trend_warning: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

export default function AIInsightsCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/insights');
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to generate insights');
        return;
      }

      setData(json.data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">AI Financial Advisor</h2>
              <p className="text-xs text-[var(--muted)]">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing...
              </>
            ) : data ? (
              <>
                <RefreshCw size={14} />
                Refresh
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate Insights
              </>
            )}
          </button>
        </div>

        {!data && !loading && !error && (
          <p className="text-sm text-[var(--muted)] text-center py-6">
            Click &ldquo;Generate Insights&rdquo; to get AI-powered financial advice based on your spending patterns.
          </p>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              {(error.includes('API key') || error.includes('not configured') || error.includes('rate limit')) && (
                <p className="text-xs text-red-500/70 mt-1">
                  {error.includes('rate limit')
                    ? 'The Gemini API has a free tier rate limit. Wait 30-60 seconds and try again.'
                    : 'Add your Gemini API key to .env file: GEMINI_API_KEY="your-key-here". Get one free at aistudio.google.com/apikey'}
                </p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 dark:border-violet-900" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-violet-500" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Analyzing your finances with AI...</p>
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <>
          {/* Score + Summary */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--glass-border)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={scoreColor(data.overallScore)}
                    strokeWidth="3"
                    strokeDasharray={`${data.overallScore}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold" style={{ color: scoreColor(data.overallScore) }}>
                    {data.overallScore}
                  </span>
                  <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider font-semibold">
                    {data.scoreLabel}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">Financial Health Score</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {data.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              Smart Insights
            </h3>
            {data.insights?.map((insight: any) => {
              const colors = COLOR_MAP[insight.type] || COLOR_MAP.budget_advice;
              const isExpanded = expanded === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  layout
                  className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : insight.id)}
                    className="w-full flex items-start gap-3 p-4 text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.text} ${colors.bg}`}>
                      {insight.icon || ICON_MAP[insight.type] || <Zap size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${colors.text}`}>
                          {insight.title}
                        </p>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${IMPACT_COLORS[insight.impact] || IMPACT_COLORS.medium}`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                    <div className="mt-1 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-[var(--muted)]" />
                      ) : (
                        <ChevronDown size={16} className="text-[var(--muted)]" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="pt-2 border-t border-current/10">
                          <div className="flex items-start gap-2 mt-2">
                            <Shield size={14} className="text-[var(--muted)] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-[var(--foreground)] mb-1">Action Item</p>
                              <p className="text-xs text-[var(--muted)]">
                                {insight.actionable}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Budget Optimizations */}
          {data.optimizations?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                <Target size={16} className="text-orange-500" />
                Budget Optimization Suggestions
              </h3>
              <div className="space-y-3">
                {data.optimizations.map((opt: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{opt.category}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{opt.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[var(--muted)]">
                        ₹{opt.currentSpend?.toLocaleString('en-IN')} → ₹{opt.suggestedBudget?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs font-bold text-green-500">
                        Save ₹{opt.savingPotential?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Advice */}
          {data.monthlyAdvice && (
            <div className="glass-card p-5 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                    Monthly Advice
                  </p>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {data.monthlyAdvice}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
