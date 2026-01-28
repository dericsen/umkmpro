// User Entity Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  password_hash: string;
  full_name: string;
  email_verified: boolean;
  phone_verified: boolean;
  status: 'active' | 'suspended' | 'deleted';
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  device_info?: {
    device_type?: string;
    os?: string;
    browser?: string;
    ip?: string;
  };
  ip_address?: string;
  expires_at: Date;
  created_at: Date;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type?: string;
  category?: string;
  scale?: 'micro' | 'small' | 'medium';
  tax_id?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  subscription_expires_at?: Date;
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'cashier' | 'viewer';
  permissions?: Record<string, boolean>;
  invited_by?: string;
  joined_at: Date;
  created_at: Date;
}

// Product Entity Types
export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  supplier_id?: string;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  wholesale_price?: number;
  wholesale_min_qty?: number;
  track_inventory: boolean;
  current_stock: number;
  min_stock_level: number;
  max_stock_level?: number;
  image_url?: string;
  is_active: boolean;
  tags?: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damaged';
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
}

// Customer Entity Types
export interface Customer {
  id: string;
  business_id: string;
  customer_code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customer_type: 'regular' | 'vip' | 'wholesale';
  segment?: string;
  total_purchase: number;
  total_transactions: number;
  avg_transaction_value: number;
  outstanding_debt: number;
  credit_limit: number;
  first_purchase_at?: Date;
  last_purchase_at?: Date;
  rfm_score?: {
    recency: number;
    frequency: number;
    monetary: number;
    score: number;
  };
  birthday?: Date;
  notes?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Transaction Entity Types
export interface Transaction {
  id: string;
  business_id: string;
  transaction_number: string;
  transaction_date: Date;
  customer_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'transfer' | 'debt' | 'ewallet' | 'card';
  payment_status: 'paid' | 'partial' | 'unpaid';
  paid_amount: number;
  change_amount: number;
  notes?: string;
  cashier_id?: string;
  source: 'pos' | 'online' | 'whatsapp' | 'manual';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id?: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  unit_cost?: number;
  discount_amount: number;
  subtotal: number;
  created_at: Date;
}

// Financial Entity Types
export interface Account {
  id: string;
  business_id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category?: string;
  parent_id?: string;
  balance: number;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface JournalEntry {
  id: string;
  business_id: string;
  entry_number: string;
  entry_date: Date;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  created_at: Date;
}

export interface Expense {
  id: string;
  business_id: string;
  expense_number: string;
  expense_date: Date;
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  receipt_url?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Debt Entity Types
export interface Debt {
  id: string;
  business_id: string;
  customer_id: string;
  transaction_id?: string;
  debt_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date?: Date;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  payment_date: Date;
  amount: number;
  payment_method?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
}

// Analytics Entity Types
export interface DailySalesSummary {
  id: string;
  business_id: string;
  summary_date: Date;
  total_transactions: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  total_customers: number;
  new_customers: number;
  top_product_id?: string;
  top_product_revenue?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductPerformance {
  id: string;
  business_id: string;
  product_id: string;
  period_month: Date;
  units_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin: number;
  created_at: Date;
  updated_at: Date;
}

// Notification Entity Types
export interface Notification {
  id: string;
  business_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
}
