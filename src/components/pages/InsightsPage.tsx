'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import TopCategories from '@/components/insights/TopCategories';
import MonthlyComparison from '@/components/insights/MonthlyComparison';
import SpendingInsights from '@/components/insights/SpendingInsights';
import ExpenseTrendChart from '@/components/insights/ExpenseTrendChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InsightsPage() {
  const accounts = useStore((s) => s.accounts);
  const [accountId, setAccountId] = useState<string>('all');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Deep dive into your financial habits and trends.
          </p>
        </div>
        
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-[200px] h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]" style={{ borderColor: 'var(--glass-border)' }}>
            <SelectValue placeholder="All Accounts">
              {accountId === 'all' ? 'All Accounts' : accounts.find(a => a.id === accountId)?.name || 'All Accounts'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)]">
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>{acc.icon} {acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SpendingInsights accountId={accountId} />

      <ExpenseTrendChart accountId={accountId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCategories accountId={accountId} />
        <MonthlyComparison accountId={accountId} />
      </div>
    </motion.div>
  );
}
