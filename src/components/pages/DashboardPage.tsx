'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import SummaryCards from '@/components/dashboard/SummaryCards';
import BalanceTrendChart from '@/components/dashboard/BalanceTrendChart';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AccountOverview from '@/components/dashboard/AccountOverview';

interface DashboardData {
  id: string;
  name: string;
  email: string;
  financialAccounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    monthlyBudget: number;
    isDefault: boolean;
    icon: string;
    color: string;
    transactions: Array<{
      id: string;
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      date: string;
      description: string;
      // add other fields you need
    }>;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard');
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          console.log(result.data)
          setData(result.data);
        } else {
          setError(result.error || 'Something went wrong');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading your finance dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error: {error || 'No data'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Pass the full data or specific parts */}
      <SummaryCards accounts={data.financialAccounts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceTrendChart accounts={data.financialAccounts} />
        <SpendingBreakdown accounts={data.financialAccounts} />
      </div>

      <AccountOverview accounts={data.financialAccounts} />

      <RecentTransactions accounts={data.financialAccounts} />
    </motion.div>
  );
}