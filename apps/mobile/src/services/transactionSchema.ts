import { z } from "zod";

export const transactionSchema = z.object({
  item: z.string().describe("What was purchased"),
  amount: z.number().describe("The numeric amount spent"),
  currency: z.string().describe("Currency code, default USD").default("USD"),
  category: z
    .enum([
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Health",
      "Entertainment",
      "Groceries",
      "Other",
    ])
    .describe("Spending category"),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const TRANSACTION_SYSTEM_PROMPT = `You are a financial transaction parser. The user will describe an expense in natural language. Extract the item, amount, currency, and category. Respond with JSON only.

Examples:
User: "coffee 4.50"
{"item":"coffee","amount":4.50,"currency":"USD","category":"Food"}

User: "2 pieces of bread 200 pesos"
{"item":"bread","amount":200,"currency":"PHP","category":"Groceries"}`;
