-- ==========================================
-- EENVOQ AI - COMPLETE SUPABASE SQL SCHEMA
-- ==========================================
-- This script contains the table definitions, indexes, constraints, 
-- and automatic triggers to fully set up your Supabase Database.
-- Run this script in the SQL Editor of your Supabase Dashboard.

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES / BUSINESSES TABLE
-- Supports multi-tenant context, enabling multiple operators or single-owner businesses
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    currency VARCHAR(10) DEFAULT 'NGN',
    owner_id UUID, -- References auth.users or public.profiles (assigned in next step)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.stores is 'Business stores registered on Eenvoq.';

-- 2. USER PROFILES & TEAM MEMBERS (ACCOUNT OPERATORS) TABLE
-- Tracks permissions and pins for all supervisors, cashiers, auditors, and owners.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Admin', 'Manager', 'Supervisor', 'Cashier', 'Auditor')),
    pin VARCHAR(6) NULL, -- Login/sales passcode authorization pin
    is_creator BOOLEAN DEFAULT false,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.profiles is 'Team members and business operators with granular role permissions.';

-- Link the owner_id in public.stores to public.profiles safely
ALTER TABLE public.stores 
    ADD CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. INVENTORY & STOCKS TABLE
-- Maps perfectly with the InventoryItem interface in the React app
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Uncategorized',
    stock_level NUMERIC DEFAULT 0 NOT NULL,
    safe_min NUMERIC DEFAULT 10 NOT NULL,
    velocity NUMERIC DEFAULT 0 NOT NULL, -- Average units sold per day
    forecasted_depletion_days INTEGER DEFAULT 999 NOT NULL,
    restock_date TIMESTAMP WITH TIME ZONE,
    base_price NUMERIC DEFAULT 0 NOT NULL,
    unit VARCHAR(50) DEFAULT 'units' NOT NULL,
    supplier_name TEXT,
    supplier_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.inventory is 'Stock inventory records with dynamic velocity triggers and alerts.';

-- 4. SALES RECEIPTS TABLE
-- Reconciles with verified POS register scans, includes tracking for edited/deleted states
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT DEFAULT 'Walk-in Customer' NOT NULL,
    customer_phone TEXT,
    total_amount NUMERIC DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('verified', 'failed', 'pending')),
    reward_status VARCHAR(20) DEFAULT 'none' NOT NULL CHECK (reward_status IN ('earned', 'claimed', 'none')),
    reward_points INTEGER DEFAULT 0 NOT NULL,
    warranty_status VARCHAR(20) DEFAULT 'none' NOT NULL CHECK (warranty_status IN ('active', 'expired', 'none')),
    security_signature TEXT UNIQUE NOT NULL, -- Embedded cryptographic signature of truth
    created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    audit_logs JSONB DEFAULT '[]'::jsonb -- Audit trail for overrides and edits
);

comment on table public.receipts is 'Sales transactions synced from active register terminals.';

-- 5. RECEIPT ITEMS TABLE
-- Stores single lines of every product item on a receipt
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    name TEXT NOT NULL, -- Snaps snapshot of current item name
    quantity NUMERIC DEFAULT 1 NOT NULL,
    price NUMERIC DEFAULT 0 NOT NULL
);

comment on table public.receipt_items is 'Individual line items of store receipts';

-- 6. DEBTORS TABLE
-- Keeps track of customer overdraft constraints, risk ratings, and locks
CREATE TABLE IF NOT EXISTS public.debtors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount_owed NUMERIC DEFAULT 0 NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    credit_score INTEGER DEFAULT 80 NOT NULL CHECK (credit_score >= 0 AND credit_score <= 100),
    risk_rating VARCHAR(10) DEFAULT 'low' NOT NULL CHECK (risk_rating IN ('low', 'medium', 'high')),
    locked BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.debtors is 'Ledger for customer credit tabs, overdue accounts, and auto-locks.';

-- 7. DEBTOR PAYMENTS HISTORIC TABLE
-- Records partial payment logs for installment plans
CREATE TABLE IF NOT EXISTS public.debtor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debtor_id UUID REFERENCES public.debtors(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

comment on table public.debtor_payments is 'Installment payment history tracking for debtors.';

-- 8. TRUTH AUDITS TABLE
-- Main register log showing expected vs. declared cash reconciliation audit balances
CREATE TABLE IF NOT EXISTS public.truth_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    physical_cash NUMERIC DEFAULT 0 NOT NULL,
    bank_transfers NUMERIC DEFAULT 0 NOT NULL,
    pos_payments NUMERIC DEFAULT 0 NOT NULL,
    mobile_money NUMERIC DEFAULT 0 NOT NULL,
    other_income NUMERIC DEFAULT 0 NOT NULL,
    expected_revenue NUMERIC DEFAULT 0 NOT NULL,
    declared_revenue NUMERIC DEFAULT 0 NOT NULL,
    difference NUMERIC DEFAULT 0 NOT NULL, -- Discrepancies represent leakage levels
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    risk_level VARCHAR(20) DEFAULT 'low' NOT NULL CHECK (risk_level IN ('low', 'medium', 'critical')),
    details TEXT,
    audited_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

comment on table public.truth_audits is 'Daily cash till and register balance verification sheets.';

-- 9. CHAT LOGS TAB (AI MESSAGES & THREADS)
-- Persists AI session histories for every executive profile
CREATE TABLE IF NOT EXISTS public.ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
    text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb, -- Store list of attachment descriptors: [{name: "", type: "", url: ""}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.ai_chats is 'Thread messages with the Eenvoq Business intelligence AI.';

-- 10. SYSTEM ALERTS / NOTIFICATIONS
-- Active operational warnings (e.g. low stock warnings, debtor locks, cash leakage alarms)
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('variance', 'inventory', 'debtor', 'retention', 'verification')),
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

comment on table public.system_alerts is 'Store operations push notifications and alert boards.';


-- ==========================================
-- RELIABLE DATABASE INDEXES FOR ENHANCED PERF
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_profile_store ON public.profiles(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON public.inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_receipts_store ON public.receipts(store_id);
CREATE INDEX IF NOT EXISTS idx_receipts_signature ON public.receipts(security_signature);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON public.receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_debtors_store_lock ON public.debtors(store_id, locked);
CREATE INDEX IF NOT EXISTS idx_truth_audits_store_date ON public.truth_audits(store_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_chats_profile ON public.ai_chats(profile_id, created_at);


-- ==========================================
-- AUTOMATION & SECURITY TRIGGER INTEGRATIONS
-- ==========================================

-- Trigger to automatically create a public.profiles record when a new user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, pin, is_creator)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Store Owner'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'Owner'),
        COALESCE(new.raw_user_meta_data->>'pin', '1234'),
        TRUE
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to Supabase's auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();


-- Trigger to automatically calculate discrepancy "difference" in dynamic registers truth audits
CREATE OR REPLACE FUNCTION public.calculate_audit_leakage()
RETURNS trigger AS $$
BEGIN
    -- Declared revenue is sum of recorded incoming registers
    new.declared_revenue := new.physical_cash + new.bank_transfers + new.pos_payments + new.mobile_money + new.other_income;
    new.difference := new.declared_revenue - new.expected_revenue;
    
    -- Dynamically tag risk level based on leakage percentage or size
    IF ABS(new.difference) > 150000 THEN
        new.risk_level := 'critical';
    ELSIF ABS(new.difference) > 30000 THEN
        new.risk_level := 'medium';
    ELSE
        new.risk_level := 'low';
    END IF;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_audit_inserted_or_updated
    BEFORE INSERT OR UPDATE ON public.truth_audits
    FOR EACH ROW EXECUTE FUNCTION public.calculate_audit_leakage();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enabling Row Level Security ensures that owners, supervisor accounts and cashiers
-- can only read/edit records belonging to their matching store workspace.

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debtor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truth_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- 1. STORES Policies
CREATE POLICY "Users can view stores they belong to"
    ON public.stores FOR SELECT
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE store_id = public.stores.id) OR owner_id = auth.uid());

CREATE POLICY "Owners can manage stores"
    ON public.stores FOR ALL
    USING (owner_id = auth.uid());

-- 2. PROFILES Policies
CREATE POLICY "Users can read profiles from same store"
    ON public.profiles FOR SELECT
    USING (store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid()) OR id = auth.uid());

CREATE POLICY "Owners/Admins can manage team profiles"
    ON public.profiles FOR ALL
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('Owner', 'Admin')));

-- 3. INVENTORY Policies
CREATE POLICY "Store employees can read inventory"
    ON public.inventory FOR SELECT
    USING (store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Store supervisors and above can edit stock"
    ON public.inventory FOR ALL
    USING (
        store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
        AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('Owner', 'Admin', 'Manager', 'Supervisor'))
    );

-- 4. RECEIPTS / SALES Policies
CREATE POLICY "Store employees can read/write receipts"
    ON public.receipts FOR ALL
    USING (store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

-- 5. DEBTORS Policies
CREATE POLICY "Store employees can manage debtors list"
    ON public.debtors FOR ALL
    USING (store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid()));

-- 6. TRUTH AUDITS Policies
CREATE POLICY "Auditors / Owners can read/write audits"
    ON public.truth_audits FOR ALL
    USING (
        store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
        AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('Owner', 'Admin', 'Manager', 'Auditor'))
    );

-- 7. CHATS Policies
CREATE POLICY "Users can only see their own AI chats"
    ON public.ai_chats FOR ALL
    USING (profile_id = auth.uid());
