export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  customerName: string;
  customerPhone: string;
  items: ReceiptItem[];
  totalAmount: number;
  timestamp: string;
  status: 'verified' | 'failed' | 'pending';
  rewardStatus: 'earned' | 'claimed' | 'none';
  rewardPoints: number;
  warrantyStatus: 'active' | 'expired' | 'none';
  securitySignature: string;
  createdBy?: { name: string; role: string; email: string };
  editedBy?: { name: string; role: string; email: string; timestamp: string }[];
  deleted?: boolean;
  deletedBy?: { name: string; role: string; email: string; timestamp: string };
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Auditor';
  email: string;
  isCreator?: boolean;
  pin?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  safeMin: number;
  velocity: number; // units sold per day
  forecastedDepletionDays: number;
  restockDate: string;
  basePrice: number;
  unit: string;
  supplierName: string;
  supplierPhone: string;
}

export interface PaymentItem {
  date: string;
  amount: number;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  amountOwed: number;
  dueDate: string;
  creditScore: number; // 0-100
  riskRating: 'low' | 'medium' | 'high';
  locked: boolean;
  paymentHistory: PaymentItem[];
}

export interface TruthAudit {
  id: string;
  date: string;
  physicalCash: number;
  bankTransfers: number;
  posPayments: number;
  mobileMoney: number;
  otherIncome: number;
  expectedRevenue: number;
  declaredRevenue: number;
  difference: number;
  confidenceScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'critical';
  details: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'variance' | 'inventory' | 'debtor' | 'retention' | 'verification';
  read: boolean;
}

export interface UserSession {
  name: string;
  email: string;
  storeName: string;
  role: string;
  storeLocation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  attachments?: { name: string; type: string; url?: string }[];
}

export interface RetentionCampaign {
  id: string;
  customerName: string;
  phone: string;
  lastVisitDaysAgo: number;
  churnProbability: number; // percentage
  healthScore: number; // 0-100
  suggestedAction: string;
  draftSms: string;
  draftWhatsapp: string;
  draftEmail: string;
}
