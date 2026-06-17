import { Receipt, InventoryItem, Debtor, TruthAudit, Alert, UserSession, RetentionCampaign } from './types';

export const DEFAULT_USER: UserSession = {
  name: "Chinedu Okafor",
  email: "chinedu@grocerygate.ng",
  storeName: "GroceryGate Mega Stores",
  role: "Supermarket",
  storeLocation: "14 Broad Street, Lagos Island, Lagos",
};

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: "TXN-2026-61301",
    customerName: "Amara Nwachukwu",
    customerPhone: "+234 803 123 4567",
    items: [
      { name: "Indomie Onion Chicken 70g (Carton)", quantity: 2, price: 10500 },
      { name: "Mamador Vegetable Oil 3L", quantity: 1, price: 12500 },
      { name: "Golden Penny Sugar 1kg", quantity: 3, price: 3400 }
    ],
    totalAmount: 43700,
    timestamp: "2026-06-13T10:45:00Z",
    status: "verified",
    rewardStatus: "claimed",
    rewardPoints: 437,
    warrantyStatus: "none",
    securitySignature: "TSP-NGR-89D1-EF32"
  },
  {
    id: "TXN-2026-61302",
    customerName: "Olumide Adebayo",
    customerPhone: "+234 815 987 6543",
    items: [
      { name: "Royal Stallion Rice 50kg", quantity: 1, price: 82000 },
      { name: "Peak Liquid Milk 170g (Tin)", quantity: 12, price: 1100 }
    ],
    totalAmount: 95200,
    timestamp: "2026-06-13T12:15:00Z",
    status: "verified",
    rewardStatus: "earned",
    rewardPoints: 952,
    warrantyStatus: "none",
    securitySignature: "TSP-NGR-33FA-90BC"
  },
  {
    id: "TXN-2026-61303",
    customerName: "Fatima Bello",
    customerPhone: "+234 902 444 5555",
    items: [
      { name: "Dangote Semolina 10kg", quantity: 2, price: 13500 },
      { name: "Milo Refill Pack 800g", quantity: 1, price: 9200 }
    ],
    totalAmount: 36200,
    timestamp: "2026-06-13T14:30:00Z",
    status: "pending",
    rewardStatus: "none",
    rewardPoints: 0,
    warrantyStatus: "none",
    securitySignature: "TSP-NGR-12D9-44BB"
  },
  {
    id: "TXN-2026-61304",
    customerName: "Emeka Obi",
    customerPhone: "+234 809 333 3333",
    items: [
      { name: "Dano Milk Powder 800g", quantity: 1, price: 8400 },
      { name: "Knorr Chicken Cubes (Pack)", quantity: 5, price: 2100 }
    ],
    totalAmount: 18900,
    timestamp: "2026-06-13T15:55:00Z",
    status: "verified",
    rewardStatus: "earned",
    rewardPoints: 189,
    warrantyStatus: "none",
    securitySignature: "TSP-NGR-77EF-11AA"
  },
  {
    id: "TXN-2026-61305",
    customerName: "Mrs. Ngozi Eze",
    customerPhone: "+234 703 555 1212",
    items: [
      { name: "Haier Thermocool Standing Fridge", quantity: 1, price: 445000 }
    ],
    totalAmount: 445000,
    timestamp: "2026-06-13T16:20:00Z",
    status: "verified",
    rewardStatus: "earned",
    rewardPoints: 4450,
    warrantyStatus: "active",
    securitySignature: "TSP-NGR-90AB-77FF"
  },
  {
    id: "TXN-2026-61306",
    customerName: "Tunde Bakare",
    customerPhone: "+234 812 666 7777",
    items: [
      { name: "Supa Garri Yellow 50kg", quantity: 2, price: 32000 },
      { name: "Gino Tomato Paste 70g (Sachet)", quantity: 20, price: 350 }
    ],
    totalAmount: 71000,
    timestamp: "2026-06-13T17:10:00Z",
    status: "failed", // Flagged layout context discrepancy
    rewardStatus: "none",
    rewardPoints: 0,
    warrantyStatus: "none",
    securitySignature: "TSP-NGR-66D2-99EA"
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "INV-RICE-01",
    name: "Royal Stallion Rice 50kg",
    category: "Grains & Cereals",
    stockLevel: 14,
    safeMin: 10,
    velocity: 2.1,
    forecastedDepletionDays: 6.6,
    restockDate: "2026-06-18",
    basePrice: 82000,
    unit: "Bags",
    supplierName: "Rice Growers Assc North",
    supplierPhone: "+234 802 999 8888"
  },
  {
    id: "INV-IND-02",
    name: "Indomie Onion Chicken 70g (Carton)",
    category: "Noodles & Pasta",
    stockLevel: 8,
    safeMin: 15, // Below safe level!
    velocity: 3.5,
    forecastedDepletionDays: 2.2,
    restockDate: "2026-06-15",
    basePrice: 10500,
    unit: "Cartons",
    supplierName: "Tolaram Distributors",
    supplierPhone: "+234 814 333 4444"
  },
  {
    id: "INV-OIL-03",
    name: "Mamador Vegetable Oil 3L",
    category: "Cooking Oils",
    stockLevel: 25,
    safeMin: 12,
    velocity: 1.8,
    forecastedDepletionDays: 13.8,
    restockDate: "2026-06-25",
    basePrice: 12500,
    unit: "Bottles",
    supplierName: "PZ Wilmar Depot",
    supplierPhone: "+234 809 111 2222"
  },
  {
    id: "INV-COCO-04",
    name: "Milo Refill Pack 800g",
    category: "Beverages",
    stockLevel: 4,
    safeMin: 10, // Below safe level!
    velocity: 1.2,
    forecastedDepletionDays: 3.3,
    restockDate: "2026-06-16",
    basePrice: 9200,
    unit: "Packs",
    supplierName: "Nestle Foods Nigeria PLC",
    supplierPhone: "+234 703 000 9999"
  },
  {
    id: "INV-GAR-05",
    name: "Supa Garri Yellow 50kg",
    category: "Grains & Cereals",
    stockLevel: 5,
    safeMin: 8, // Below safe level!
    velocity: 1.1,
    forecastedDepletionDays: 4.5,
    restockDate: "2026-06-17",
    basePrice: 32000,
    unit: "Bags",
    supplierName: "Ijebu Staples Union",
    supplierPhone: "+234 812 444 5555"
  },
  {
    id: "INV-PEAK-06",
    name: "Peak Liquid Milk 170g (Tin)",
    category: "Dairy",
    stockLevel: 144,
    safeMin: 60,
    velocity: 18.0,
    forecastedDepletionDays: 8.0,
    restockDate: "2026-06-21",
    basePrice: 1100,
    unit: "Tins",
    supplierName: "FrieslandCampina WAMCO",
    supplierPhone: "+234 816 888 7777"
  }
];

export const INITIAL_DEBTORS: Debtor[] = [
  {
    id: "DEB-001",
    name: "Baba Sadiq Wholesalers",
    phone: "+234 803 777 8888",
    amountOwed: 350000,
    dueDate: "2026-06-10", // Overdue!
    creditScore: 48,
    riskRating: "high",
    locked: true,
    paymentHistory: [
      { date: "2026-05-01", amount: 150000 },
      { date: "2026-05-15", amount: 100000 }
    ]
  },
  {
    id: "DEB-002",
    name: "Mama Chioma POS & Groceries",
    phone: "+234 815 111 2222",
    amountOwed: 125000,
    dueDate: "2026-06-18",
    creditScore: 78,
    riskRating: "low",
    locked: false,
    paymentHistory: [
      { date: "2026-05-20", amount: 50000 },
      { date: "2026-06-05", amount: 50000 }
    ]
  },
  {
    id: "DEB-003",
    name: "Alhaji Nura Distribution",
    phone: "+234 901 222 3333",
    amountOwed: 780000,
    dueDate: "2026-06-14", // Due tomorrow!
    creditScore: 62,
    riskRating: "medium",
    locked: false,
    paymentHistory: [
      { date: "2026-05-10", amount: 300000 }
    ]
  },
  {
    id: "DEB-004",
    name: "Sarah Cole Boutique",
    phone: "+234 705 999 0000",
    amountOwed: 95000,
    dueDate: "2026-06-05", // Overdue!
    creditScore: 55,
    riskRating: "high",
    locked: true,
    paymentHistory: []
  }
];

export const INITIAL_AUDITS: TruthAudit[] = [
  {
    id: "AUD-001",
    date: "2026-06-13",
    physicalCash: 120000,
    bankTransfers: 350000,
    posPayments: 210000,
    mobileMoney: 45000,
    otherIncome: 0,
    expectedRevenue: 770000,
    declaredRevenue: 725000,
    difference: -45000, // Cash shortage!
    confidenceScore: 91,
    riskLevel: "critical",
    details: "Discrepancy of ₦45,000 detected between expected sales and sum declaration. Suspected discrepancy occurred in the 3PM-5PM cash-till register shift. High probability of sales leakage or unauthorized discount overrides."
  },
  {
    id: "AUD-002",
    date: "2026-06-12",
    physicalCash: 195000,
    bankTransfers: 210000,
    posPayments: 185000,
    mobileMoney: 30000,
    otherIncome: 6000,
    expectedRevenue: 625000,
    declaredRevenue: 626000,
    difference: 1000, // Minimal overage
    confidenceScore: 98,
    riskLevel: "low",
    details: "Excellent audit balance matching internal receipt registries. Small positive cash fluctuation of ₦1,000 recorded due to minor change overrides."
  },
  {
    id: "AUD-003",
    date: "2026-06-11",
    physicalCash: 130000,
    bankTransfers: 240000,
    posPayments: 155000,
    mobileMoney: 20000,
    otherIncome: 0,
    expectedRevenue: 565000,
    declaredRevenue: 545000,
    difference: -20000, // Medium shortage
    confidenceScore: 84,
    riskLevel: "medium",
    details: "Discrepancy of ₦20,000 logged. Inventory logs suggest standard cash-till manual discount adjustments not checked by manager."
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-001",
    title: "Truth Check Critical Discrepancy",
    description: "₦45,000 cash shortage detected on shift balance for June 13th. High probability of sales leakage between 3 PM and 5 PM.",
    timestamp: "2026-06-13T18:00:00Z",
    priority: "critical",
    category: "variance",
    read: false
  },
  {
    id: "ALT-002",
    title: "Critical Inventory Shortage Below Safe Min",
    description: "Indomie Onion Chicken (Carton) is down to 8 units. Predicted total stockout within 2.2 days.",
    timestamp: "2026-06-13T16:30:00Z",
    priority: "high",
    category: "inventory",
    read: false
  },
  {
    id: "ALT-003",
    title: "Credit Lock Outlawed: Bab Sadiq Wholesalers",
    description: "Baba Sadiq Wholesalers is 3 days past their ₦350,000 debt due date. Automated B2B order routing locked.",
    timestamp: "2026-06-13T09:00:00Z",
    priority: "high",
    category: "debtor",
    read: false
  },
  {
    id: "ALT-004",
    title: "High-Churn Risk Warning",
    description: "Amara Nwachukwu (Top Supermarket client) has a high-churn alarm flag triggered. No checkout visit recorded in 7 days.",
    timestamp: "2026-06-12T14:15:00Z",
    priority: "medium",
    category: "retention",
    read: true
  }
];

export const INITIAL_RETENTION_CAMPAIGNS: RetentionCampaign[] = [
  {
    id: "RET-001",
    customerName: "Amara Nwachukwu",
    phone: "+234 803 123 4567",
    lastVisitDaysAgo: 7,
    churnProbability: 62,
    healthScore: 55,
    suggestedAction: "Offer 5% discount on Indomie Onion chicken cartons.",
    draftSms: "Hello Amara, we miss you at GroceryGate! Since it's been 7 days, here is an exclusive 5% coupon for your next carton order. Ref: GG-R5.",
    draftWhatsapp: "Hi Amara! 🌟 We noticed you haven't restocked in a week. As one of our premium partners, we've locked in a special 5% loyalty discount on your favorite noodles. Reply YES to auto-ship with free delivery! - Chinedu from GroceryGate",
    draftEmail: "Subject: We Miss You! Here is 5% Off Your Next Restock at GroceryGate\n\nDear Amara,\n\nWe haven't seen you in 7 days. We hope your retail business is doing great! To help you restock we have generated a custom code GG-R5 for 5% off."
  },
  {
    id: "RET-002",
    customerName: "Chief Sylvester Ugo",
    phone: "+234 805 444 6666",
    lastVisitDaysAgo: 12,
    churnProbability: 85,
    healthScore: 30,
    suggestedAction: "Direct diagnostic call + loyalty re-engagement code.",
    draftSms: "Dear Chief Sylvester, hope you are well. We haven't seen you in 12 days. Visit us today for an exclusive ₦10,000 cash-back reward of GG-U9. GroceryGate.",
    draftWhatsapp: "Greetings Chief Sylvester! 🤝 Chinedu here from GroceryGate. It's been 12 days since your last purchase. We value your business tremendously. I've credited a ₦10,000 voucher to your account valid on your next invoice. Let us know if we should deliver tomorrow!",
    draftEmail: "Subject: Special ₦10,000 Loyalty Reward Credited to Your Account\n\nDear Chief Sylvester,\n\nOur records show you haven't visited in 12 days. We want to ensure you get the absolute best price and availability..."
  },
  {
    id: "RET-003",
    customerName: "Kemi Adesina",
    phone: "+234 809 222 1111",
    lastVisitDaysAgo: 4,
    churnProbability: 38,
    healthScore: 82,
    suggestedAction: "Nudge feedback survey / points balance check.",
    draftSms: "Hi Kemi, you have 1,420 uncollected GroceryGate reward points! Redeem them on your next retail order this weekend.",
    draftWhatsapp: "Hi Kemi! Just a quick heads up that your reward balance is sitting at a healthy 1,420 points (valuing ₦1,420 cashback!). Redeem them this week on any item. See you soon! - GroceryGate",
    draftEmail: "Subject: Your Points Statement - 1,420 Points Awaiting Redemption\n\nGood day Kemi,\n\nJust a reminder that you have 1,420 reward points..."
  }
];

export const SAMPLE_AI_INSIGHTS = [
  "⚠️ **Revenue leak detected:** Physical cash reconciliation on June 13th showed a deficit of ₦45,000, concentrated between 3:00 PM and 5:00 PM. Cross-examination of receipts reveals 2 unrecorded transactions on cash till #1.",
  "📦 **Velocity Alert:** Indomie Noodles (Onion Chicken) is depopulating faster than expected. Velocity rose to 3.5 cartons/day. Order 12 cartons now to avoid complete shelf stockout on Tuesday.",
  "📉 **Retention Trigger:** Churn warning flagged for Baba Sadiq and Sarah Cole due to extended overdue balances. Sarah Cole is restricted from additional B2B credit terms.",
  "💰 **Reconciliation Match:** Digital receipts totals equaled credit/debit POS transfer receipts for June 12th. Shift risk score is optimal (98% confidence)."
];
