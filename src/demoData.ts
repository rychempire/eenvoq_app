import { Receipt, InventoryItem, Debtor, TruthAudit, Alert, UserSession, RetentionCampaign } from './types';

export const DEFAULT_USER: UserSession = {
  name: "Merchant Owner",
  email: "owner@business.com",
  storeName: "My Shop",
  role: "Retailer",
  storeLocation: "Add your store location in Settings",
};

export const INITIAL_RECEIPTS: Receipt[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_DEBTORS: Debtor[] = [];

export const INITIAL_AUDITS: TruthAudit[] = [];

export const INITIAL_ALERTS: Alert[] = [];

export const INITIAL_RETENTION_CAMPAIGNS: RetentionCampaign[] = [];

export const SAMPLE_AI_INSIGHTS: string[] = [];
