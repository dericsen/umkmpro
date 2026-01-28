// Authentication DTOs
export interface RegisterDTO {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenDTO {
  refresh_token: string;
}

// Business DTOs
export interface CreateBusinessDTO {
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
}

export interface UpdateBusinessDTO {
  business_name?: string;
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
  settings?: Record<string, any>;
}

// Product DTOs
export interface CreateProductDTO {
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
  track_inventory?: boolean;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  image_url?: string;
  tags?: string[];
}

export interface UpdateProductDTO {
  category_id?: string;
  supplier_id?: string;
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  wholesale_price?: number;
  wholesale_min_qty?: number;
  track_inventory?: boolean;
  min_stock_level?: number;
  max_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
  tags?: string[];
}

export interface AdjustStockDTO {
  adjustment_type: 'add' | 'subtract' | 'set';
  quantity: number;
  notes?: string;
}

// Transaction DTOs
export interface CreateTransactionDTO {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }>;
  discount_amount?: number;
  tax_amount?: number;
  payment_method: 'cash' | 'transfer' | 'debt' | 'ewallet' | 'card';
  paid_amount?: number;
  change_amount?: number;
  notes?: string;
  source?: 'pos' | 'online' | 'whatsapp' | 'manual';
}

export interface TransactionResponseDTO {
  id: string;
  transaction_number: string;
  transaction_date: Date;
  customer?: {
    id: string;
    name: string;
  };
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  paid_amount: number;
  change_amount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

// Customer DTOs
export interface CreateCustomerDTO {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customer_type?: 'regular' | 'vip' | 'wholesale';
  credit_limit?: number;
  birthday?: Date;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerDTO {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customer_type?: 'regular' | 'vip' | 'wholesale';
  credit_limit?: number;
  birthday?: Date;
  notes?: string;
  tags?: string[];
}

// Expense DTOs
export interface CreateExpenseDTO {
  expense_date: Date;
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  receipt_url?: string;
}

export interface UpdateExpenseDTO {
  expense_date?: Date;
  category?: string;
  amount?: number;
  payment_method?: string;
  description?: string;
  receipt_url?: string;
}

// Debt DTOs
export interface CreateDebtPaymentDTO {
  payment_date: Date;
  amount: number;
  payment_method?: string;
  notes?: string;
}

// Analytics DTOs
export interface DashboardStatsDTO {
  today: {
    revenue: number;
    transactions: number;
    customers: number;
  };
  this_month: {
    revenue: number;
    profit: number;
    transactions: number;
  };
  trends: {
    revenue_change: number;
    profit_change: number;
    transaction_change: number;
  };
}

export interface SalesTrendDTO {
  date: string;
  revenue: number;
  transactions: number;
  profit: number;
}

export interface ProductPerformanceDTO {
  product_id: string;
  product_name: string;
  units_sold: number;
  revenue: number;
  profit: number;
  profit_margin: number;
}

export interface CustomerInsightDTO {
  customer_id: string;
  customer_name: string;
  total_purchase: number;
  total_transactions: number;
  avg_transaction_value: number;
  last_purchase_days_ago: number;
  segment: string;
}

// AI Chat DTOs
export interface ChatMessageDTO {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequestDTO {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponseDTO {
  conversation_id: string;
  message: string;
  suggestions?: string[];
  insights?: Array<{
    type: string;
    title: string;
    description: string;
    data?: any;
  }>;
}

// Pagination DTOs
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Filter DTOs
export interface TransactionFilterDTO extends PaginationParams {
  start_date?: string;
  end_date?: string;
  customer_id?: string;
  payment_method?: string;
  payment_status?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface ProductFilterDTO extends PaginationParams {
  category_id?: string;
  supplier_id?: string;
  is_active?: boolean;
  low_stock?: boolean;
  search?: string;
}

export interface CustomerFilterDTO extends PaginationParams {
  customer_type?: string;
  segment?: string;
  has_debt?: boolean;
  search?: string;
}

// Report DTOs
export interface ProfitLossReportDTO {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: {
    sales: number;
    other_income: number;
    total: number;
  };
  cost_of_goods_sold: number;
  gross_profit: number;
  expenses: {
    operational: number;
    salary: number;
    marketing: number;
    other: number;
    total: number;
  };
  net_profit: number;
  profit_margin: number;
}

export interface CashFlowReportDTO {
  period: {
    start_date: string;
    end_date: string;
  };
  opening_balance: number;
  cash_inflows: {
    sales: number;
    debt_payments: number;
    other: number;
    total: number;
  };
  cash_outflows: {
    purchases: number;
    expenses: number;
    debt_repayments: number;
    other: number;
    total: number;
  };
  net_cash_flow: number;
  closing_balance: number;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}
