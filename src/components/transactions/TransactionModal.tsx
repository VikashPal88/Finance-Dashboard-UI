'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction, TransactionType, Category } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export default function TransactionModal({ isOpen, onClose, editTransaction }: TransactionModalProps) {
  const { addTransaction, editTransaction: updateTransaction, accounts, categories: allCategories } = useStore();
  const isEdit = !!editTransaction;

  const defaultAccount = accounts.find((a) => a.isDefault);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining' as Category,
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    accountId: defaultAccount?.id || 'acc-main',
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Close calendar if clicking outside could be added, but user wants toggle to close on select
  const currentCategories = allCategories.filter(c => c.type === form.type);

  useEffect(() => {
    if (editTransaction) {
      setForm({
        description: editTransaction.description,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        type: editTransaction.type,
        date: editTransaction.date,
        accountId: editTransaction.accountId || defaultAccount?.id || 'acc-main',
      });
    } else {
      setForm({
        description: '',
        amount: '',
        category: currentCategories.length > 0 ? currentCategories[0].name : 'Food & Dining',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        accountId: defaultAccount?.id || 'acc-main',
      });
    }
    setShowCalendar(false);
  }, [editTransaction, isOpen, defaultAccount?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      date: form.date,
      accountId: form.accountId,
    };

    if (isEdit && editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--dropdown-bg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {isEdit ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Type</label>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, type: 'expense', category: 'Food & Dining' });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === 'expense'
                        ? 'bg-expense text-white'
                        : 'bg-[var(--surface)] text-[var(--muted)]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, type: 'income', category: 'Salary' });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === 'income'
                        ? 'bg-income text-white'
                        : 'bg-[var(--surface)] text-[var(--muted)]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Account</label>
                <Select value={form.accountId} onValueChange={(val) => setForm({ ...form, accountId: val })}>
                  <SelectTrigger className="w-full h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]" style={{ borderColor: 'var(--glass-border)' }}>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60]">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Swiggy dinner order"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Category</label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val as Category })}>
                  <SelectTrigger className="w-full h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]" style={{ borderColor: 'var(--glass-border)' }}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60]">
                    {currentCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date - Custom Calendar Toggle */}
              <div className="space-y-1.5 relative flex flex-col">
                <label className="text-xs font-medium text-[var(--muted)]">Date</label>
                <Popover>
                  <PopoverTrigger
                    className="w-full h-[44px] px-4 rounded-xl text-sm text-left border flex items-center justify-between transition-colors hover:bg-[var(--surface-hover)] focus:ring-2 focus:ring-primary/20"
                    style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--input-bg)' }}
                  >
                    <span>{formatDisplayDate(form.date)}</span>
                    <CalendarIcon className="text-[var(--muted)] h-4 w-4" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60] bg-[var(--dropdown-bg)] border-[var(--glass-border)]" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(form.date)}
                      onSelect={(date) => {
                        if (date) setForm({ ...form, date: format(date, 'yyyy-MM-dd') });
                      }}
                      initialFocus
                      className="text-[var(--foreground)]"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              >
                {isEdit ? 'Save Changes' : 'Add Transaction'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
