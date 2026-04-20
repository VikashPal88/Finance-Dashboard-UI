"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Mic,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  IndianRupee,
  PieChart,
  Bell,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Manual Entry",
    description:
      "Quick forms optimized for UPI, card, and cash transactions with smart category detection.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Receipt Scanner",
    description:
      "Snap a photo of any receipt — AI extracts amount, vendor, and category automatically.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice Input",
    description:
      '"Spent 450 on Swiggy dinner" — just speak naturally and we\'ll log it for you.',
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Advanced Analytics",
    description:
      "Monthly trends, category breakdowns, savings rate, and spending predictions at a glance.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Budget Alerts",
    description:
      "Set monthly budgets and get notified at 50%, 75%, and 90% thresholds before overspending.",
    gradient: "from-red-500 to-rose-400",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bank-Grade Security",
    description:
      "End-to-end encryption, Arcjet protection against bots & attacks, and secure authentication.",
    gradient: "from-indigo-500 to-violet-400",
  },
];

const stats = [
  { value: "3", label: "Ways to Add", icon: <Zap className="w-5 h-5" /> },
  {
    value: "₹0",
    label: "Forever Free",
    icon: <IndianRupee className="w-5 h-5" />,
  },
  {
    value: "AI",
    label: "Powered Insights",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    value: "100%",
    label: "Data Privacy",
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--glass-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text tracking-tight">
                FinDash
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Built for India&apos;s Digital Economy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Track Every{" "}
            <span className="gradient-text">Rupee</span>
            <br />
            <span className="text-[var(--muted-foreground)]">
              Master Your Finances
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Add transactions by{" "}
            <span className="text-[var(--foreground)] font-medium">form</span>,{" "}
            <span className="text-[var(--foreground)] font-medium">
              receipt scan
            </span>
            , or{" "}
            <span className="text-[var(--foreground)] font-medium">voice</span>.
            Get AI-powered analytics, budget alerts, and spending insights —
            completely free.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-8 py-4 text-base font-medium rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <section className="relative py-12 px-4 border-y border-[var(--glass-border)]">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Stay on Top</span>
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              Three ways to add transactions, intelligent analytics, and
              proactive budget alerts — built for daily use.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group relative p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all duration-300 hover:border-indigo-500/30"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--glass-border)]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Simple as <span className="gradient-text">1-2-3</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up with email, Google, or GitHub in seconds.",
                icon: <Wallet className="w-8 h-8 text-indigo-400" />,
              },
              {
                step: "02",
                title: "Add Transactions",
                desc: "Use form, scan receipts, or speak — whichever is fastest.",
                icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
              },
              {
                step: "03",
                title: "Get Insights",
                desc: "View trends, category breakdowns, and budget status instantly.",
                icon: <PieChart className="w-8 h-8 text-cyan-400" />,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative text-center p-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-black text-[var(--surface-hover)] absolute top-4 right-6 select-none">
                  {item.step}
                </div>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-8 max-w-xl mx-auto">
              Join thousands of Indians who are tracking every UPI payment,
              every card swipe, and every cash expense — effortlessly.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--glass-border)] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">₹</span>
            </div>
            <span className="font-semibold text-[var(--foreground)]">
              FinDash
            </span>
          </div>
          <p>© {new Date().getFullYear()} FinDash. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span>Protected by Arcjet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
