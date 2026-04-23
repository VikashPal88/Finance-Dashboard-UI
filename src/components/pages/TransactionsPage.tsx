'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import TransactionList from '@/components/transactions/TransactionList';

function TransactionsPageInner() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId') || undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      <TransactionList initialAccountId={accountId} />
    </motion.div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <TransactionsPageInner />
    </Suspense>
  );
}
