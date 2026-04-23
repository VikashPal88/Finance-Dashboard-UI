'use client';

import { motion } from 'framer-motion';
import { Camera, Mic, FileUp, PenLine } from 'lucide-react';
import { useState } from 'react';

interface SmartAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  available: boolean;
}

export default function SmartAddTransaction({ onManualAdd }: { onManualAdd: () => void }) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const actions: SmartAction[] = [
    {
      icon: <Camera size={22} />,
      label: 'Scan Receipt',
      description: 'Take a photo of your bill',
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange-light',
      available: false,
    },
    {
      icon: <Mic size={22} />,
      label: 'Voice Entry',
      description: 'Speak to add transaction',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      available: false,
    },
    {
      icon: <FileUp size={22} />,
      label: 'Upload Statement',
      description: 'Import bank statements',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      available: false,
    },
    {
      icon: <PenLine size={22} />,
      label: 'Manual Entry',
      description: 'Add transaction manually',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      available: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="dash-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Smart Add Transaction</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">Quick ways to log your expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (action.available) {
                onManualAdd();
              } else {
                showToast(`${action.label} — Coming Soon! 🚀`);
              }
            }}
            className="relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] hover:border-accent-orange/40 transition-all group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-xl ${action.bgColor} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[var(--foreground)]">{action.label}</p>
              <p className="text-[10px] text-[var(--muted)] mt-0.5 leading-tight">{action.description}</p>
            </div>
            {!action.available && (
              <span className="absolute top-2 right-2 text-[8px] font-bold bg-accent-orange/10 text-accent-orange px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Soon
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium"
        >
          {toastMsg}
        </motion.div>
      )}
    </motion.div>
  );
}
