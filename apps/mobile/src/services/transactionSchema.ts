export const TRANSACTION_SCHEMA = {
  type: "object" as const,
  properties: {
    item: { type: "string" as const },
    amount: { type: "number" as const },
    currency: { type: "string" as const },
    category: { type: "string" as const },
  },
  required: ["item", "amount"],
};

export const TRANSACTION_SYSTEM_PROMPT = `You are a financial transaction parser. The user will describe an expense in natural language. Extract the following fields and respond with JSON only:
- item: what was purchased
- amount: the numeric amount spent
- currency: the currency code (default USD if not specified)
- category: one of Food, Transport, Shopping, Bills, Health, Entertainment, Groceries, Other

Examples:
User: "coffee 4.50"
{"item":"coffee","amount":4.50,"currency":"USD","category":"Food"}

User: "2 pieces of bread 200 pesos"
{"item":"bread","amount":200,"currency":"PHP","category":"Groceries"}`;
