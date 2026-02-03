
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO String
}

export interface Saving {
  id: string;
  amount: number;
  type: 'ADD' | 'SUBTRACT';
  description: string;
  date: string; // ISO String
}

export type DebtActionType = 'TAKEN' | 'REPAID';

export interface Debt {
  id: string;
  type: 'RECEIVABLE' | 'PAYABLE'; 
  personName: string;
  amount: number;
  description: string;
  date: string; // ISO String
  actionType: DebtActionType; // Whether they took more or repaid
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface Settings {
  language: 'bn' | 'en';
  theme: 'light' | 'dark';
}

export interface AppData {
  transactions: Transaction[];
  savings: Saving[];
  debts: Debt[];
  parties: string[]; // List of unique person names
  profile: UserProfile;
  settings: Settings;
}
