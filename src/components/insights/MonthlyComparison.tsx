'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatMonth } from '@/utils/formatters';
import { Transaction } from '@/types';

type Timeframe = '1w' | '1m' | '6m' | '1y';

function getGroupedData(transactions: Transaction[], timeframe: Timeframe) {
  const map = new Map<string, { income: number; expenses: number }>();
  
  const now = new Date();
  let pastDate = new Date();
  
  if (timeframe === '1w') pastDate.setDate(now.getDate() - 7);
  if (timeframe === '1m') pastDate.setMonth(now.getMonth() - 1);
  if (timeframe === '6m') pastDate.setMonth(now.getMonth() - 6);
  if (timeframe === '1y') pastDate.setFullYear(now.getFullYear() - 1);

  const filtered = transactions.filter(t => new Date(t.date) >= pastDate);

  filtered.forEach((t) => {
    let key = '';
    if (timeframe === '1w' || timeframe === '1m') {
      key = t.date; // YYYY-MM-DD
    } else {
      key = t.date.substring(0, 7); // YYYY-MM
    }
    
    const existing = map.get(key) || { income: 0, expenses: 0 };
    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expenses += t.amount;
    }
    map.set(key, existing);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      let label = key;
      if (timeframe === '1w' || timeframe === '1m') {
        const d = new Date(key);
        label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      } else {
        label = formatMonth(key);
      }
      return {
        label,
        key,
        income: data.income,
        expenses: data.expenses,
      };
    });
}

export default function MonthlyComparison({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((s) => s.transactions);
  const [timeframe, setTimeframe] = useState<Timeframe>('6m');

  const transactions = accountId && accountId !== 'all' 
    ? allTransactions.filter(t => t.accountId === accountId)
    : allTransactions;

  const data = useMemo(() => getGroupedData(transactions, timeframe), [transactions, timeframe]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="glass-card-sm p-3 shadow-lg"
        style={{ backgroundColor: 'var(--dropdown-bg)' }}
      >
        <p className="text-xs font-medium mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--muted)] capitalize">{entry.name}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold">Income vs Expenses</h3>
          <span className="text-xs text-[var(--muted)]">Periodic comparison</span>
        </div>
        
        <Select value={timeframe} onValueChange={(val) => setTimeframe(val as Timeframe)}>
          <SelectTrigger className="w-[120px] h-[36px] rounded-lg text-xs border bg-[var(--surface)] text-[var(--foreground)]" style={{ borderColor: 'var(--glass-border)' }}>
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] text-xs z-[60]">
            <SelectItem value="1w">1 Week</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-[var(--muted)]">
          No data in this period
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)' }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                barSize={timeframe === '1m' ? 12 : 24}
                fillOpacity={0.85}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                barSize={timeframe === '1m' ? 12 : 24}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-3 rounded bg-income" />
          Income
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-3 rounded bg-expense" />
          Expenses
        </div>
      </div>
    </motion.div>
  );
}
