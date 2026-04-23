import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

/**
 * Get the Gemini model for text generation
 */
export function getGeminiModel() {
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        safetySettings,
    });
}

/**
 * Get the Gemini model for vision (image analysis)
 */
export function getGeminiVisionModel() {
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        safetySettings,
    });
}

/**
 * Parse receipt image using Gemini Vision
 */
export async function parseReceiptImage(base64Image: string, mimeType: string) {
    const model = getGeminiVisionModel();

    const prompt = `You are a financial receipt parser. Analyze this receipt image and extract transaction details.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "transactions": [
    {
      "amount": <number - total amount paid>,
      "description": "<string - store name or merchant and brief description>",
      "date": "<string - date in YYYY-MM-DD format, use today if not visible>",
      "category": "<string - one of: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Travel, Other>",
      "type": "EXPENSE"
    }
  ],
  "confidence": <number 0-100 - how confident you are in the extraction>,
  "rawText": "<string - key text you can read from the receipt>"
}

If the image is not a receipt or you cannot extract data, return:
{"transactions": [], "confidence": 0, "rawText": "Could not parse receipt"}

Important:
- Amount should be numeric (no currency symbols)
- Date should be YYYY-MM-DD format
- Pick the most appropriate category from the list`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ]);

    const text = result.response.text().trim();
    // Clean potential markdown wrapping
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}

/**
 * Parse voice/natural language input into transaction data
 */
export async function parseVoiceInput(transcript: string) {
    const model = getGeminiModel();
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are a financial transaction parser. Convert this spoken/natural language input into structured transaction data.

Input: "${transcript}"

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "amount": <number - the amount mentioned>,
  "description": "<string - what the transaction is for>",
  "date": "<string - date in YYYY-MM-DD format, default to ${today} if not specified>",
  "category": "<string - one of: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Salary, Freelance, Investment, Rental, Other>",
  "type": "<string - INCOME or EXPENSE based on context>",
  "confidence": <number 0-100>
}

Examples of parsing:
- "Spent 500 on groceries" → amount: 500, category: "Groceries", type: "EXPENSE"
- "Received salary 50000" → amount: 50000, category: "Salary", type: "INCOME"
- "Paid electricity bill 2000 yesterday" → amount: 2000, category: "Utilities", type: "EXPENSE", date: yesterday's date
- "Got 1500 from freelance work" → amount: 1500, category: "Freelance", type: "INCOME"

If you cannot parse the input, return:
{"amount": 0, "description": "", "date": "${today}", "category": "Other", "type": "EXPENSE", "confidence": 0}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}

/**
 * Parse bank statement (CSV text or image) into multiple transactions
 */
export async function parseStatement(content: string, isImage: boolean = false, base64?: string, mimeType?: string) {
    const model = isImage ? getGeminiVisionModel() : getGeminiModel();
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are a bank statement parser. Extract all transactions from this ${isImage ? "bank statement image" : "bank statement text/CSV"}.

${isImage ? "" : `Statement Content:\n${content}`}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "transactions": [
    {
      "amount": <number - absolute amount>,
      "description": "<string - transaction narration/description>",
      "date": "<string - YYYY-MM-DD format>",
      "category": "<string - best guess from: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Utilities, Groceries, Salary, Freelance, Investment, Rental, EMI & Loans, Insurance, Other>",
      "type": "<string - INCOME or EXPENSE>"
    }
  ],
  "accountInfo": {
    "bankName": "<string or null>",
    "accountNumber": "<string - last 4 digits or null>",
    "statementPeriod": "<string or null>"
  },
  "summary": {
    "totalTransactions": <number>,
    "totalIncome": <number>,
    "totalExpense": <number>
  }
}

Important:
- Credits/deposits/salary are INCOME, debits/withdrawals/purchases are EXPENSE
- Use absolute amounts (no negatives)
- Guess the best category based on the description
- If date year is missing, assume current year`;

    const parts: any[] = [prompt];
    if (isImage && base64 && mimeType) {
        parts.push({
            inlineData: { mimeType, data: base64 },
        });
    }

    const result = await model.generateContent(parts);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}

/**
 * Generate AI-powered financial insights and optimization advice
 */
export async function generateFinancialInsights(financialData: {
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    categoryBreakdown: { category: string; amount: number; percentage: number }[];
    monthlyTrend: { month: string; income: number; expenses: number }[];
    accountBudgets: { name: string; budget: number; spent: number }[];
    topMerchants: { name: string; amount: number; count: number }[];
}) {
    const model = getGeminiModel();

    const prompt = `You are an expert financial advisor AI for a personal finance dashboard. Analyze this user's financial data and provide actionable insights.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "overallScore": <number 0-100 - financial health score>,
  "scoreLabel": "<string - Poor/Fair/Good/Excellent>",
  "summary": "<string - 2-3 sentence overall financial health summary>",
  "insights": [
    {
      "id": "<unique string id>",
      "type": "<string - saving_tip | spending_alert | income_opportunity | budget_advice | trend_warning>",
      "icon": "<string - emoji>",
      "title": "<string - short title>",
      "description": "<string - detailed explanation with specific numbers>",
      "impact": "<string - low | medium | high>",
      "actionable": "<string - specific action the user can take>"
    }
  ],
  "optimizations": [
    {
      "category": "<string - category name>",
      "currentSpend": <number>,
      "suggestedBudget": <number>,
      "savingPotential": <number>,
      "reason": "<string - why this optimization>"
    }
  ],
  "monthlyAdvice": "<string - specific advice based on monthly trends>"
}

Rules:
- Provide 4-6 specific insights based on actual data
- Reference real numbers and percentages
- Be specific and actionable, not generic
- Amounts are in Indian Rupees (₹)
- Focus on areas where spending seems high relative to income
- Suggest realistic budget allocations
- If savings rate is low, prioritize savings advice`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}
