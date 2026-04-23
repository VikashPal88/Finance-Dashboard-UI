"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertTriangle, X, Bell } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/utils/formatters";
import EmptyState from "@/components/ui/EmptyState";
import { AccountCard } from "@/components/ui/AccountCard";
import { CreateAccountDrawer } from "@/components/ui/create-account-drawer";
import { EditAccountDrawer } from "@/components/ui/edit-account-drawer";
import { fetchJsonCached, invalidateClientFetch } from "@/lib/client-fetch";

export default function AccountsPage() {
  const { transactions, budgetAlerts, dismissBudgetAlert } = useStore();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  const activeAlerts = budgetAlerts
    ? budgetAlerts.filter((a) => !a.dismissed)
    : [];

  const fetchAccounts = async (force = false) => {
    try {
      setLoading(true);
      const data = await fetchJsonCached<any[]>("/api/accounts", undefined, {
        force,
      });
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    fetchJsonCached<any[]>("/api/accounts")
      .then((data) => {
        if (isActive) {
          setAccounts(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch accounts", err);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openEdit = (account: any) => {
    setEditingAccount(account);
  };

  const deleteAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        invalidateClientFetch(
          "/api/accounts",
          `/api/accounts/${id}`,
          "/api/dashboard",
          "/api/budget",
        );
        fetchAccounts(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setDefaultAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        invalidateClientFetch(
          "/api/accounts",
          `/api/accounts/${id}`,
          "/api/dashboard",
          "/api/budget",
        );
        fetchAccounts(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAccountStats = (accountId: string) => {
    const accountTxs = transactions.filter((t) => t.accountId === accountId);
    const income = accountTxs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = accountTxs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const txCount = accountTxs.length;
    return { income, expenses, balance: income - expenses, txCount };
  };

  const getMonthlySpent = (accountId: string) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.accountId === accountId &&
          t.date.substring(0, 7) === currentMonth,
      )
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {activeAlerts.map((alert) => {
              const isOver = alert.percentage >= 100;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  className={`glass-card p-4 border-l-4 ${isOver ? "border-l-red-500 bg-red-500/5" : "border-l-amber-500 bg-amber-500/5"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${isOver ? "bg-red-500/10" : "bg-amber-500/10"}`}
                    >
                      {isOver ? (
                        <AlertTriangle size={18} className="text-red-400" />
                      ) : (
                        <Bell size={18} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-sm font-semibold ${isOver ? "text-red-400" : "text-amber-400"}`}
                        >
                          {isOver
                            ? "🚨 Budget Exceeded!"
                            : "⚠️ Budget Alert — 90% Reached"}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface)]">
                          {alert.accountName}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        You&apos;ve spent{" "}
                        <span className="font-semibold text-[var(--foreground)]">
                          {formatCurrency(alert.spent)}
                        </span>{" "}
                        of your{" "}
                        <span className="font-semibold text-[var(--foreground)]">
                          {formatCurrency(alert.budget)}
                        </span>{" "}
                        budget ({alert.percentage.toFixed(1)}%).
                      </p>
                    </div>
                    <button
                      onClick={() => dismissBudgetAlert(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <X size={14} className="text-[var(--muted)]" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your financial accounts and budgets.
          </p>
        </div>
        <CreateAccountDrawer
          onSuccess={() => {
            invalidateClientFetch(
              "/api/accounts",
              "/api/dashboard",
              "/api/budget",
            );
            fetchAccounts(true);
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
          >
            <Plus size={16} />
            New Account
          </motion.button>
        </CreateAccountDrawer>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-sm text-[var(--muted)]">
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start tracking expenses by category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {accounts.map((account) => {
            const stats = getAccountStats(account.id);
            const monthlySpent = getMonthlySpent(account.id);

            return (
              <AccountCard
                key={account.id}
                account={account}
                onSetDefault={setDefaultAccount}
                onEdit={openEdit}
                onDelete={deleteAccount}
                stats={stats}
                monthlySpent={monthlySpent}
              />
            );
          })}
        </div>
      )}

      {/* Edit Account Drawer */}
      <EditAccountDrawer
        account={editingAccount}
        open={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSuccess={() => {
          setEditingAccount(null);
          invalidateClientFetch(
            "/api/accounts",
            editingAccount
              ? `/api/accounts/${editingAccount.id}`
              : "/api/accounts",
            "/api/dashboard",
            "/api/budget",
          );
          fetchAccounts(true);
        }}
      />
    </motion.div>
  );
}
