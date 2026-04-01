import type {
  Transaction,
  SavingsGoal,
  Habit,
  Priority,
  Contact,
  SleepLog,
  Spark,
  QuickListItem,
  DomainScore,
} from "@/types";

export const MOCK_DOMAIN_SCORES: DomainScore[] = [
  { label: "Money", icon: "💰", progress: 0.7 },
  { label: "Time", icon: "⏰", progress: 0.65 },
  { label: "Health", icon: "🏥", progress: 0.8 },
  { label: "Mind", icon: "🧠", progress: 0.6 },
  { label: "People", icon: "❤️", progress: 0.85 },
  { label: "Growth", icon: "🎯", progress: 0.75 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", type: "expense", amount: 4.5, currency: "USD", item: "Morning coffee", category: "Food", date: "2026-04-01" },
  { id: "2", type: "expense", amount: 32.0, currency: "USD", item: "Groceries", category: "Groceries", date: "2026-04-01" },
  { id: "3", type: "expense", amount: 2.5, currency: "USD", item: "Bus fare", category: "Transport", date: "2026-03-31" },
  { id: "4", type: "expense", amount: 18.5, currency: "USD", item: "Lunch with team", category: "Food", date: "2026-03-31" },
];

export const MOCK_SAVINGS_GOALS: SavingsGoal[] = [
  { id: "1", name: "Travel Fund", targetAmount: 3000, currentAmount: 1200, currency: "USD", targetDate: "Oct 2026" },
];

export const MOCK_HABITS: Habit[] = [
  { id: "1", name: "Drink water", icon: "💧", isCompleted: true },
  { id: "2", name: "Read 15 min", icon: "📖", isCompleted: true },
  { id: "3", name: "Exercise", icon: "🏃", isCompleted: false },
  { id: "4", name: "Meditate", icon: "🧘", isCompleted: false },
  { id: "5", name: "No phone before bed", icon: "📵", isCompleted: false },
];

export const MOCK_PRIORITIES: Priority[] = [
  { id: "1", text: "Finish project proposal", type: "must", isCompleted: true },
  { id: "2", text: "Call dentist for appointment", type: "win", isCompleted: false },
  { id: "3", text: "Review budget for next month", type: "overdue", isCompleted: false },
];

export const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "Mom", relationship: "Family", lastTalkedDaysAgo: 4, birthday: "Jun 15" },
  { id: "2", name: "Best friend", relationship: "Friend", lastTalkedDaysAgo: 2 },
  { id: "3", name: "Dad", relationship: "Family", lastTalkedDaysAgo: 1, birthday: "Apr 4", giftIdea: "He loves fishing gear" },
  { id: "4", name: "Sister", relationship: "Family", lastTalkedDaysAgo: 8 },
];

export const MOCK_SLEEP: SleepLog = {
  id: "1",
  hours: 7,
  minutes: 20,
  date: "2026-04-01",
};

export const MOCK_SPARK: Spark = {
  id: "1",
  text: "Take a 10-minute walk",
  domain: "Health",
  isCompleted: false,
};

export const MOCK_QUICK_LIST: QuickListItem[] = [
  { id: "1", text: "Buy groceries: eggs, bread, milk", isCompleted: false },
  { id: "2", text: "Return library books", isCompleted: false },
  { id: "3", text: "Look into gym membership", isCompleted: false },
];

export const MOCK_CLAWDI_SCORE = 74;
export const MOCK_BUDGET_LEFT = 420;
export const MOCK_DAILY_BUDGET = 500;
export const MOCK_BALANCE = 2450;
export const MOCK_INCOME = 3200;
export const MOCK_SPENT = 750;
export const MOCK_STRESS_LEVEL = 4;
export const MOCK_WEEKLY_SLEEP_AVG = 6.5;
