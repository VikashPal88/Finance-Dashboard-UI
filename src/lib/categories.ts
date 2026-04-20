/**
 * Default app-provided categories.
 * These are NOT stored in the database — they're universal constants.
 * Only user-created custom categories go to the DB.
 */

export interface CategoryItem {
  id: string;        // Stable identifier (prefixed with "default-" for built-ins)
  name: string;
  type: 'income' | 'expense';
  color: string;
  isDefault: boolean; // true = app-provided, false = user-created
}

// ─── Default Expense Categories ──────────────────────────────────────────────

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'default-food', name: 'Food & Dining', type: 'expense', color: '#f97316', isDefault: true },
  { id: 'default-transport', name: 'Transportation', type: 'expense', color: '#3b82f6', isDefault: true },
  { id: 'default-shopping', name: 'Shopping', type: 'expense', color: '#ec4899', isDefault: true },
  { id: 'default-entertainment', name: 'Entertainment', type: 'expense', color: '#8b5cf6', isDefault: true },
  { id: 'default-bills', name: 'Bills & Utilities', type: 'expense', color: '#ef4444', isDefault: true },
  { id: 'default-healthcare', name: 'Healthcare', type: 'expense', color: '#14b8a6', isDefault: true },
  { id: 'default-education', name: 'Education', type: 'expense', color: '#6366f1', isDefault: true },
  { id: 'default-rent', name: 'Rent', type: 'expense', color: '#f43f5e', isDefault: true },
  { id: 'default-travel', name: 'Travel', type: 'expense', color: '#a855f7', isDefault: true },
  { id: 'default-groceries', name: 'Groceries', type: 'expense', color: '#84cc16', isDefault: true },
  { id: 'default-other-expense', name: 'Other', type: 'expense', color: '#6b7280', isDefault: true },
];

// ─── Default Income Categories ───────────────────────────────────────────────

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'default-salary', name: 'Salary', type: 'income', color: '#22c55e', isDefault: true },
  { id: 'default-freelance', name: 'Freelance', type: 'income', color: '#06b6d4', isDefault: true },
  { id: 'default-investments', name: 'Investments', type: 'income', color: '#eab308', isDefault: true },
  { id: 'default-other-income', name: 'Other', type: 'income', color: '#6b7280', isDefault: true },
];

// ─── All defaults combined ───────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

// ─── Color map (for any category name → color lookup) ────────────────────────

export const CATEGORY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.name, c.color])
);

/**
 * Merge default app categories with user-created custom categories.
 * Custom categories are appended after defaults. Duplicates by name+type are skipped.
 */
export function mergeCategories(
  userCategories: CategoryItem[]
): CategoryItem[] {
  const merged = [...DEFAULT_CATEGORIES];
  const existingKeys = new Set(merged.map((c) => `${c.name}::${c.type}`));

  for (const cat of userCategories) {
    const key = `${cat.name}::${cat.type}`;
    if (!existingKeys.has(key)) {
      merged.push(cat);
      existingKeys.add(key);
    }
  }

  return merged;
}

/**
 * Get merged categories filtered by type.
 */
export function getMergedCategoriesByType(
  userCategories: CategoryItem[],
  type: 'income' | 'expense'
): CategoryItem[] {
  return mergeCategories(userCategories).filter((c) => c.type === type);
}
