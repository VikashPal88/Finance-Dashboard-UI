import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

export const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Transaction Schemas ─────────────────────────────────────────────────────

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Transaction type is required",
  }),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(10_000_000, "Amount cannot exceed ₹1,00,00,000"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  date: z.string().or(z.date()),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional(),
  source: z.enum(["MANUAL", "RECEIPT_SCAN", "VOICE"]).default("MANUAL"),
});

// ─── Financial Account Schemas ───────────────────────────────────────────────

export const financialAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(50, "Account name must be at most 50 characters"),
  type: z.enum(["CURRENT", "SAVINGS"], {
    required_error: "Account type is required",
  }),
  balance: z.number().default(0),
  isDefault: z.boolean().default(false),
  icon: z.string().default("💰"),
  color: z.string().default("#6366f1"),
});

// ─── Budget Schemas ──────────────────────────────────────────────────────────

export const budgetSchema = z.object({
  amount: z
    .number()
    .positive("Budget amount must be greater than 0")
    .max(10_000_000, "Budget cannot exceed ₹1,00,00,000"),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type FinancialAccountInput = z.infer<typeof financialAccountSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
