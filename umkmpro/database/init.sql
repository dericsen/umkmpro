-- UMKMPRO Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ============================================================
-- BUSINESS ENTITIES
-- ============================================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50),
    category VARCHAR(100),
    scale VARCHAR(20) CHECK (scale IN ('micro', 'small', 'medium')),
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_name ON businesses USING gin(to_tsvector('indonesian', business_name));

CREATE TABLE business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'cashier', 'viewer')),
    permissions JSONB DEFAULT '{}'::jsonb,
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

CREATE INDEX idx_members_business ON business_members(business_id);
CREATE INDEX idx_members_user ON business_members(user_id);

-- ============================================================
-- PRODUCTS & INVENTORY
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_categories_business ON categories(business_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    payment_terms VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_suppliers_business ON suppliers(business_id);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    supplier_id UUID REFERENCES suppliers(id),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) DEFAULT 'pcs',
    
    -- Pricing
    cost_price DECIMAL(15, 2) DEFAULT 0,
    selling_price DECIMAL(15, 2) NOT NULL,
    wholesale_price DECIMAL(15, 2),
    wholesale_min_qty INT,
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT TRUE,
    current_stock DECIMAL(15, 3) DEFAULT 0,
    min_stock_level DECIMAL(15, 3) DEFAULT 0,
    max_stock_level DECIMAL(15, 3),
    
    -- Product Info
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT positive_prices CHECK (cost_price >= 0 AND selling_price > 0),
    CONSTRAINT positive_stock CHECK (current_stock >= 0)
);

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'damaged')),
    quantity DECIMAL(15, 3) NOT NULL,
    stock_before DECIMAL(15, 3) NOT NULL,
    stock_after DECIMAL(15, 3) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- ============================================================
-- CUSTOMERS (CRM)
-- ============================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    
    -- Segmentation
    customer_type VARCHAR(50) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
    segment VARCHAR(100),
    
    -- Financial
    total_purchase DECIMAL(15, 2) DEFAULT 0,
    total_transactions INT DEFAULT 0,
    avg_transaction_value DECIMAL(15, 2) DEFAULT 0,
    outstanding_debt DECIMAL(15, 2) DEFAULT 0,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    
    -- Engagement
    first_purchase_at TIMESTAMP,
    last_purchase_at TIMESTAMP,
    rfm_score JSONB,
    
    -- Additional Info
    birthday DATE,
    notes TEXT,
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT positive_financials CHECK (total_purchase >= 0 AND outstanding_debt >= 0)
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_customers_type ON customers(customer_type);

-- ============================================================
-- TRANSACTIONS (SALES)
-- ============================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    transaction_number VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Customer
    customer_id UUID REFERENCES customers(id),
    
    -- Financial
    subtotal DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'debt', 'ewallet', 'card')),
    payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    change_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Additional Info
    notes TEXT,
    cashier_id UUID REFERENCES users(id),
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'pos' CHECK (source IN ('pos', 'online', 'whatsapp', 'manual')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT positive_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND paid_amount >= 0)
);

CREATE INDEX idx_transactions_business ON transactions(business_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_status ON transactions(payment_status);
CREATE UNIQUE INDEX idx_transactions_number_unique ON transactions(business_id, transaction_number);

CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- Product snapshot
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    
    -- Quantity & Pricing
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(50),
    unit_price DECIMAL(15, 2) NOT NULL,
    unit_cost DECIMAL(15, 2),
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    subtotal DECIMAL(15, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_item_amounts CHECK (quantity > 0 AND unit_price >= 0 AND subtotal >= 0)
);

CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);

-- ============================================================
-- ACCOUNTING & FINANCE
-- ============================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    category VARCHAR(100),
    parent_id UUID REFERENCES accounts(id),
    balance DECIMAL(15, 2) DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(business_id, account_code)
);

CREATE INDEX idx_accounts_business ON accounts(business_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, entry_number)
);

CREATE INDEX idx_journal_entries_business ON journal_entries(business_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);

CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT debit_credit_check CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    expense_number VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    description TEXT,
    receipt_url VARCHAR(500),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT positive_expense CHECK (amount > 0),
    UNIQUE(business_id, expense_number)
);

CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ============================================================
-- DEBT MANAGEMENT
-- ============================================================

CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    
    debt_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    
    due_date DATE,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_debt CHECK (debt_amount > 0 AND paid_amount >= 0 AND remaining_amount >= 0)
);

CREATE INDEX idx_debts_business ON debts(business_id);
CREATE INDEX idx_debts_customer ON debts(customer_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date) WHERE status IN ('unpaid', 'partial');

CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_payment CHECK (amount > 0)
);

CREATE INDEX idx_debt_payments_debt ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_date ON debt_payments(payment_date);

-- ============================================================
-- ANALYTICS & REPORTING
-- ============================================================

CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    total_transactions INT DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    gross_profit DECIMAL(15, 2) DEFAULT 0,
    profit_margin DECIMAL(5, 2) DEFAULT 0,
    
    total_customers INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    
    top_product_id UUID REFERENCES products(id),
    top_product_revenue DECIMAL(15, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, summary_date)
);

CREATE INDEX idx_daily_summary_business_date ON daily_sales_summary(business_id, summary_date);

CREATE TABLE product_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    period_month DATE NOT NULL,
    
    units_sold DECIMAL(15, 3) DEFAULT 0,
    revenue DECIMAL(15, 2) DEFAULT 0,
    cost DECIMAL(15, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    profit_margin DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, product_id, period_month)
);

CREATE INDEX idx_product_perf_business ON product_performance(business_id, period_month);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_business ON notifications(business_id);

-- ============================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate customer code
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
    max_code INTEGER;
BEGIN
    IF NEW.customer_code IS NULL THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 5) AS INTEGER)), 0) + 1
        INTO max_code
        FROM customers
        WHERE business_id = NEW.business_id AND customer_code LIKE 'CUST%';
        
        NEW.customer_code := 'CUST' || LPAD(max_code::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_customer_code_trigger
BEFORE INSERT ON customers
FOR EACH ROW EXECUTE FUNCTION generate_customer_code();

-- ============================================================
-- INITIAL DATA (System Accounts)
-- ============================================================

-- This will be populated by migration scripts
-- Default chart of accounts for Indonesian SMEs
