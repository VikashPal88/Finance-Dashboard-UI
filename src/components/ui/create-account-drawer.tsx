"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Wallet, PiggyBank, X, Plus, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const drawerAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.coerce.number().min(0, "Balance must be 0 or more"),
  monthlyBudget: z.coerce.number().min(0, "Budget must be 0 or more"),
  isDefault: z.boolean(),
});

type DrawerAccountInput = z.infer<typeof drawerAccountSchema>;

interface CreateAccountDrawerProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const ACCOUNT_TYPES = [
  {
    value: "CURRENT" as const,
    label: "Current / Checking",
    description: "For everyday spending",
    icon: <Wallet size={18} />,
  },
  {
    value: "SAVINGS" as const,
    label: "Savings",
    description: "Grow your money",
    icon: <PiggyBank size={18} />,
  },
];

export function CreateAccountDrawer({
  children,
  onSuccess,
}: CreateAccountDrawerProps) {
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"CURRENT" | "SAVINGS">("CURRENT");
  const [balance, setBalance] = useState("0");
  const [monthlyBudget, setMonthlyBudget] = useState("0");
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setType("CURRENT");
    setBalance("0");
    setMonthlyBudget("0");
    setIsDefault(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name,
      type,
      balance: Number(balance),
      monthlyBudget: Number(monthlyBudget),
      isDefault,
    };

    const result = drawerAccountSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.data.name,
          type: result.data.type,
          balance: result.data.balance,
          monthlyBudget: result.data.monthlyBudget,
          isDefault: result.data.isDefault,
          // color & icon will go here once schema supports them
        }),
      });

      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      onSuccess?.();
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {/* Backdrop + Bottom-up sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-colors"
            />

            {/* Bottom sheet — slides up */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] flex flex-col rounded-t-3xl shadow-2xl bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-5 border-b border-gray-200 dark:border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New Account
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                    Add a new financial account to track
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X
                    size={20}
                    className="text-gray-600 dark:text-neutral-400"
                  />
                </button>
              </div>

              {/* Scrollable form */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <form
                  id="create-account-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Account Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Account Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Main Checking, Emergency Fund"
                      className="w-full px-4 py-3 text-sm rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Account Type — card selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ACCOUNT_TYPES.map((t) => {
                        const selected = type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`relative p-4 rounded-lg border-2 text-left transition-all ${selected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-400"
                                : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-neutral-600"
                              }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 border transition-all ${selected
                                  ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-500 dark:border-blue-400"
                                  : "bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border-gray-300 dark:border-neutral-700"
                                }`}
                            >
                              {t.icon}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                              {t.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                              {t.description}
                            </p>
                            {selected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Initial Balance */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Initial Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-neutral-400 font-medium">
                        ₹
                      </span>
                      <input
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 text-sm rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                    {errors.balance && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {errors.balance}
                      </p>
                    )}
                  </div>

                  {/* Monthly Budget */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Target size={14} className="text-blue-500" />
                      Monthly Budget (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-neutral-400 font-medium">
                        ₹
                      </span>
                      <input
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        type="number"
                        step="100"
                        min="0"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 text-sm rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-500">
                      Set a spending limit to track progress on your account.
                    </p>
                    {errors.monthlyBudget && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {errors.monthlyBudget}
                      </p>
                    )}
                  </div>

                  {/* Set as Default */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${isDefault
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400"
                        : "border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-neutral-600"
                      }`}
                    onClick={() => setIsDefault(!isDefault)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Set as Default
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                        Used automatically for new transactions
                      </p>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full transition-colors relative ${isDefault
                          ? "bg-blue-500 dark:bg-blue-500"
                          : "bg-gray-300 dark:bg-neutral-700"
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isDefault ? "translate-x-5" : "translate-x-0.5"
                          }`}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-gray-200 dark:border-neutral-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-account-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg bg-gray-900 dark:bg-blue-500 text-white text-sm font-semibold hover:bg-gray-800 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
