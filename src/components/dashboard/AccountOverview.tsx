'use client';

import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Plus, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'next/navigation';

export default function AccountOverview({ accounts = [] }: { accounts?: any[] }) {
  const transactions = accounts?.flatMap((a: any) =>
    a.transactions?.map((t: any) => ({
      ...t,
      type: t.type.toLowerCase(),
      accountId: a.id
    })) || []
  ) || [];
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="dash-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-accent-orange" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">My Accounts</h3>
        </div>
        <button
          onClick={() => router.push('/accounts')}
          className="flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
        >
          <Plus size={14} /> Add new
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {accounts.map((account, index) => {
          const totalTx = transactions.filter((t: any) => t.accountId === account.id).length;
          const monthlySpent = transactions
            .filter((t: any) =>
              t.type === 'expense' &&
              t.accountId === account.id &&
              t.date?.substring(0, 7) === new Date().toISOString().substring(0, 7)
            )
            .reduce((s: number, t: any) => s + t.amount, 0);

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => router.push('/accounts')}
              className="snap-start flex-shrink-0 w-[220px] p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] cursor-pointer group hover:border-accent-orange/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg border"
                  style={{ borderColor: account.color, backgroundColor: `${account.color}10` }}
                >
                  {account.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">{account.name}</p>
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{account.type}</p>
                </div>
              </div>

              <p className="text-lg font-bold text-[var(--foreground)]">
                {formatCurrency(account.balance)}
              </p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-[var(--muted)]">{totalTx} transactions</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Add Account Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/accounts')}
          className="snap-start flex-shrink-0 w-[220px] p-4 rounded-2xl border-2 border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent-orange/40 transition-colors group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={20} className="text-accent-orange" />
          </div>
          <p className="text-xs font-medium text-[var(--muted)] group-hover:text-accent-orange transition-colors">Add Account</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
