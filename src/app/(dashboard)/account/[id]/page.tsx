"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  TrendingUp,
  Wallet,
  PiggyBank,
  Landmark,
  CreditCard,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { fetchJsonCached } from "@/lib/client-fetch";

// ── Account type icons ───────────────────────────────────────────────────────
const typeIcon: Record<string, React.ReactNode> = {
  CURRENT: <Wallet size={20} />,
  SAVINGS: <PiggyBank size={20} />,
  CREDIT: <CreditCard size={20} />,
};

// ── Types ────────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  category: string;
  source?: string;
}

interface AccountData {
  id: string;
  name: string;
  type: string;
  balance: number;
  monthlyBudget: number;
  isDefault: boolean;
  icon?: string;
  color?: string;
  transactions: Transaction[];
}

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await fetchJsonCached<AccountData>(`/api/accounts/${id}`);
        setAccount(data);
      } catch {
        router.push("/accounts");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) return null;

  // ── Computed stats ─────────────────────────────────────────────────────────
  const txs = account.transactions || [];
  const totalIncome = txs
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlySpent = txs
    .filter((t) => t.type === "EXPENSE" && t.date.substring(0, 7) === currentMonth)
    .reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = txs
    .filter((t) => t.type === "INCOME" && t.date.substring(0, 7) === currentMonth)
    .reduce((s, t) => s + t.amount, 0);

  const budgetPercent =
    account.monthlyBudget > 0
      ? (monthlySpent / account.monthlyBudget) * 100
      : 0;
  const isOver = budgetPercent >= 100;
  const isWarning = budgetPercent >= 90;

  // ── Category breakdown ─────────────────────────────────────────────────────
  const categoryMap: Record<string, number> = {};
  txs
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCategory = categoryBreakdown[0]?.[1] || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* ── Back button + header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/accounts")}
          className="p-2 rounded-xl border border-neutral-800 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={18} className="text-neutral-400" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-neutral-800 flex items-center justify-center text-neutral-300">
            {account.icon ? (
              <span className="text-lg">{account.icon}</span>
            ) : (
              typeIcon[account.type] || <Landmark size={20} />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{account.name}</h1>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              {account.type?.charAt(0).toUpperCase() +
                account.type?.slice(1).toLowerCase()}{" "}
              Account
              {account.isDefault && (
                <span className="ml-2 text-neutral-400">• Default</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Balance */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-neutral-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Balance
            </p>
          </div>
          <p
            className={`text-xl font-bold ${
              account.balance >= 0 ? "text-white" : "text-red-400"
            }`}
          >
            ₹
            {Math.abs(account.balance).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              This Month Income
            </p>
          </div>
          <p className="text-xl font-bold text-emerald-400">
            ₹{monthlyIncome.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Monthly Expense */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight size={14} className="text-red-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              This Month Expense
            </p>
          </div>
          <p className="text-xl font-bold text-red-400">
            ₹{monthlySpent.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-neutral-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Transactions
            </p>
          </div>
          <p className="text-xl font-bold text-white">{txs.length}</p>
        </div>
      </div>

      {/* ── Budget progress (if set) ────────────────────────────────────────── */}
      {account.monthlyBudget > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-neutral-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Monthly Budget
              </p>
            </div>
            <p
              className={`text-sm font-bold ${
                isOver
                  ? "text-red-400"
                  : isWarning
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              ₹{monthlySpent.toLocaleString("en-IN")} / ₹
              {account.monthlyBudget.toLocaleString("en-IN")}
              <span className="ml-1 text-neutral-600 text-xs">
                ({budgetPercent.toFixed(0)}%)
              </span>
            </p>
          </div>
          <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                backgroundColor: isOver
                  ? "#ef4444"
                  : isWarning
                  ? "#f59e0b"
                  : "#ffffff",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Two-column: Transactions + Category breakdown ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transactions list (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="text-sm font-bold text-white">
              Recent Transactions
            </h2>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Last {txs.length} transactions for this account
            </p>
          </div>

          {txs.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-600">
              No transactions yet for this account.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50 max-h-[500px] overflow-y-auto">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "INCOME"
                          ? "bg-emerald-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {tx.type === "INCOME" ? (
                        <ArrowUpRight size={14} className="text-emerald-500" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {tx.description || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-500 uppercase">
                          {tx.category}
                        </span>
                        <span className="text-neutral-700">•</span>
                        <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                          <Calendar size={9} />
                          {format(new Date(tx.date), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      tx.type === "INCOME"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}₹
                    {tx.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown (1/3 width) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="text-sm font-bold text-white">
              Top Spending Categories
            </h2>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-600">
              No expenses yet.
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {categoryBreakdown.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-neutral-300 capitalize">
                      {cat.toLowerCase()}
                    </p>
                    <p className="text-xs font-bold text-neutral-400">
                      ₹{amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all"
                      style={{
                        width: `${(amount / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="pt-3 border-t border-neutral-800 flex justify-between">
                <p className="text-[10px] font-semibold uppercase text-neutral-500">
                  Total Income
                </p>
                <p className="text-xs font-bold text-emerald-400">
                  ₹{totalIncome.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[10px] font-semibold uppercase text-neutral-500">
                  Total Expense
                </p>
                <p className="text-xs font-bold text-red-400">
                  ₹{totalExpense.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
