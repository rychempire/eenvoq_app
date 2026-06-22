import { createClient } from '@supabase/supabase-js';
import { Receipt, InventoryItem, Debtor, TruthAudit, Alert, TeamMember, UserSession } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ojpmisvvnihzorythuvj.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcG1pc3Z2bmloem9yeXRodXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTc2OTYsImV4cCI6MjA5NzYzMzY5Nn0.1lLMNnj_c18xN5xeo3yhMFhytdW-wkBd5aQOKV6QD4I';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Sync operations helper suite
 */

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Auditor';
  pin: string | null;
  store_id: string | null;
}

export interface DbStore {
  id: string;
  name: string;
  location: string | null;
  currency: string;
  owner_id: string | null;
}

// 1. STORES & PROFILES FETCH
export async function fetchProfileAndStore(userId: string): Promise<{ profile: DbProfile; store: DbStore | null } | null> {
  if (!supabase) return null;

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (pErr || !profile) {
    throw new Error(pErr?.message || `No profile found in profiles table for ID: ${userId}`);
  }

  let store: DbStore | null = null;
  if (profile.store_id) {
    const { data: storeData, error: sErr } = await supabase
      .from('stores')
      .select('*')
      .eq('id', profile.store_id)
      .single();
    
    if (!sErr && storeData) {
      store = storeData;
    }
  }

  return { profile, store };
}

// 2. INVENTORY SYNC
export async function fetchInventory(storeId: string): Promise<InventoryItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory:', error.message);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category || 'Uncategorized',
    stockLevel: Number(row.stock_level),
    safeMin: Number(row.safe_min),
    velocity: Number(row.velocity || 0),
    forecastedDepletionDays: Number(row.forecasted_depletion_days || 999),
    restockDate: row.restock_date || '',
    basePrice: Number(row.base_price || 0),
    unit: row.unit || 'units',
    supplierName: row.supplier_name || '',
    supplierPhone: row.supplier_phone || ''
  }));
}

export async function saveInventoryItem(storeId: string, item: Omit<InventoryItem, 'id'> & { id?: string }): Promise<InventoryItem> {
  if (!supabase) throw new Error('Supabase client is not initialized');
  
  const dbPayload = {
    store_id: storeId,
    name: item.name,
    category: item.category,
    stock_level: item.stockLevel,
    safe_min: item.safeMin,
    velocity: item.velocity,
    forecasted_depletion_days: item.forecastedDepletionDays,
    restock_date: item.restockDate || null,
    base_price: item.basePrice,
    unit: item.unit,
    supplier_name: item.supplierName || null,
    supplier_phone: item.supplierPhone || null
  };

  let result;
  if (item.id && item.id.length > 10) {
    const { data, error } = await supabase
      .from('inventory')
      .update(dbPayload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from('inventory')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return {
    id: result.id,
    name: result.name,
    category: result.category,
    stockLevel: Number(result.stock_level),
    safeMin: Number(result.safe_min),
    velocity: Number(result.velocity),
    forecastedDepletionDays: Number(result.forecasted_depletion_days),
    restockDate: result.restock_date || '',
    basePrice: Number(result.base_price),
    unit: result.unit,
    supplierName: result.supplier_name || '',
    supplierPhone: result.supplier_phone || ''
  };
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// 3. RECEIPTS & SALES
export async function fetchReceipts(storeId: string): Promise<Receipt[]> {
  if (!supabase) return [];
  // Since we also want receipt line items
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      receipt_items(*)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    items: (row.receipt_items || []).map((itm: any) => ({
      name: itm.name,
      quantity: Number(itm.quantity),
      price: Number(itm.price)
    })),
    totalAmount: Number(row.total_amount),
    timestamp: row.created_at,
    status: row.status,
    rewardStatus: row.reward_status,
    rewardPoints: Number(row.reward_points),
    warrantyStatus: row.warranty_status,
    securitySignature: row.security_signature,
    deleted: row.deleted,
    auditLogs: row.audit_logs ? (typeof row.audit_logs === 'string' ? JSON.parse(row.audit_logs) : row.audit_logs) : []
  }));
}

export async function saveReceipt(storeId: string, receipt: Receipt, creatorId: string): Promise<Receipt> {
  if (!supabase) throw new Error('Supabase client is not initialized');

  // 1. Insert receipt
  const receiptPayload = {
    store_id: storeId,
    customer_name: receipt.customerName,
    customer_phone: receipt.customerPhone || null,
    total_amount: receipt.totalAmount,
    status: receipt.status,
    reward_status: receipt.rewardStatus,
    reward_points: receipt.rewardPoints,
    warranty_status: receipt.warrantyStatus,
    security_signature: receipt.securitySignature || `VERIFY-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    created_by_id: creatorId,
    deleted: !!receipt.deleted,
    audit_logs: receipt.editedBy ? JSON.stringify(receipt.editedBy) : '[]'
  };

  const { data: recData, error: recError } = await supabase
    .from('receipts')
    .insert([receiptPayload])
    .select()
    .single();

  if (recError) throw recError;

  // 2. Insert receipt items
  if (receipt.items && receipt.items.length > 0) {
    const itemsPayload = receipt.items.map(itm => ({
      receipt_id: recData.id,
      name: itm.name,
      quantity: itm.quantity,
      price: itm.price
    }));

    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.error('Error inserting receipt items:', itemsError.message);
    }
  }

  return {
    ...receipt,
    id: recData.id,
    timestamp: recData.created_at
  };
}

// 4. DEBTORS SYNC
export async function fetchDebtors(storeId: string): Promise<Debtor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('debtors')
    .select(`
      *,
      debtor_payments(*)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    amountOwed: Number(row.amount_owed),
    dueDate: row.due_date,
    creditScore: Number(row.credit_score),
    riskRating: row.risk_rating,
    locked: row.locked,
    paymentHistory: (row.debtor_payments || []).map((pay: any) => ({
      date: pay.payment_date,
      amount: Number(pay.amount)
    }))
  }));
}

export async function saveDebtor(storeId: string, debtor: Omit<Debtor, 'id' | 'paymentHistory'> & { id?: string }): Promise<Debtor> {
  if (!supabase) throw new Error('Supabase client is not initialized');

  const payload = {
    store_id: storeId,
    name: debtor.name,
    phone: debtor.phone,
    amount_owed: debtor.amountOwed,
    due_date: debtor.dueDate,
    credit_score: debtor.creditScore,
    risk_rating: debtor.riskRating,
    locked: debtor.locked
  };

  let result;
  if (debtor.id && debtor.id.length > 10) {
    const { data, error } = await supabase
      .from('debtors')
      .update(payload)
      .eq('id', debtor.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from('debtors')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return {
    id: result.id,
    name: result.name,
    phone: result.phone,
    amountOwed: Number(result.amount_owed),
    dueDate: result.due_date,
    creditScore: Number(result.credit_score),
    riskRating: result.risk_rating,
    locked: result.locked,
    paymentHistory: []
  };
}

export async function addDebtorPayment(debtorId: string, amount: number, creatorId: string): Promise<void> {
  if (!supabase) return;
  
  // 1. Insert payment entry
  const { error: payErr } = await supabase
    .from('debtor_payments')
    .insert([{ debtor_id: debtorId, amount, created_by_id: creatorId }]);

  if (payErr) throw payErr;

  // 2. Fetch current debtor amount to subtract dynamically
  const { data: debtor } = await supabase
    .from('debtors')
    .select('amount_owed')
    .eq('id', debtorId)
    .single();

  if (debtor) {
    const newAmount = Math.max(0, Number(debtor.amount_owed) - amount);
    await supabase
      .from('debtors')
      .update({ amount_owed: newAmount })
      .eq('id', debtorId);
  }
}

// 5. TRUTH RECONCILIATION AUDITS
export async function fetchAudits(storeId: string): Promise<TruthAudit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('truth_audits')
    .select('*')
    .eq('store_id', storeId)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    date: row.date,
    physicalCash: Number(row.physical_cash),
    bankTransfers: Number(row.bank_transfers),
    posPayments: Number(row.pos_payments),
    mobileMoney: Number(row.mobile_money),
    otherIncome: Number(row.other_income),
    expectedRevenue: Number(row.expected_revenue),
    declaredRevenue: Number(row.declared_revenue),
    difference: Number(row.difference),
    confidenceScore: Number(row.confidence_score),
    riskLevel: row.risk_level,
    details: row.details || ''
  }));
}

export async function saveAudit(storeId: string, audit: Omit<TruthAudit, 'id'>, auditorId: string): Promise<TruthAudit> {
  if (!supabase) throw new Error('Supabase client is not initialized');

  const payload = {
    store_id: storeId,
    physical_cash: audit.physicalCash,
    bank_transfers: audit.bankTransfers,
    pos_payments: audit.posPayments,
    mobile_money: audit.mobileMoney,
    other_income: audit.otherIncome,
    expected_revenue: audit.expectedRevenue,
    details: audit.details,
    audited_by_id: auditorId,
    date: audit.date || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('truth_audits')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    date: data.date,
    physicalCash: Number(data.physical_cash),
    bankTransfers: Number(data.bank_transfers),
    posPayments: Number(data.pos_payments),
    mobileMoney: Number(data.mobile_money),
    otherIncome: Number(data.other_income),
    expectedRevenue: Number(data.expected_revenue),
    declaredRevenue: Number(data.declared_revenue),
    difference: Number(data.difference),
    confidenceScore: Number(data.confidence_score),
    riskLevel: data.risk_level,
    details: data.details || ''
  };
}

// 6. SYSTEM ALERTS
export async function fetchAlerts(storeId: string): Promise<Alert[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('system_alerts')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    timestamp: row.created_at,
    priority: row.priority,
    category: row.category,
    read: row.read
  }));
}

export async function saveAlert(storeId: string, alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
  if (!supabase) throw new Error('Supabase DB missing');
  const { data, error } = await supabase
    .from('system_alerts')
    .insert([{
      store_id: storeId,
      title: alert.title,
      description: alert.description,
      priority: alert.priority,
      category: alert.category,
      read: !!alert.read
    }])
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    timestamp: data.created_at,
    priority: data.priority,
    category: data.category,
    read: data.read
  };
}

export async function markAlertRead(alertId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('system_alerts')
    .update({ read: true })
    .eq('id', alertId);
}

// 7. TEAM/OPERATORS MANAGE
export async function fetchStoreTeam(storeId: string): Promise<TeamMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    isCreator: row.is_creator,
    pin: row.pin || undefined
  }));
}

export async function createTeamMemberProfile(storeId: string, member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  if (!supabase) throw new Error('Supabase client required');
  
  // Since new team members in profiles are linked to users, in an actual deployment 
  // you invite them. We will insert directly or create profile linked under this store.
  const payload = {
    id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Normally they sign up; fallback ID for profile
    name: member.name,
    email: member.email,
    role: member.role,
    pin: member.pin || '1234',
    is_creator: !!member.isCreator,
    store_id: storeId
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    isCreator: data.is_creator,
    pin: data.pin || undefined
  };
}
