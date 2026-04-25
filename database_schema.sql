-- ESTRUTURA DE BANCO DE DATOS (POSTGRESQL) - MÓDULO FINANCEIRO

-- 1. Tabela de Usuários (Extensão se necessário)
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- 2. Tabela de Transações (Fluxo de Caixa)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  category VARCHAR(50),
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Metas Financeiras
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Vendas de Serviços (Landing Pages / Consultorias)
CREATE TABLE service_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RELACIONAMENTOS & INDEXAÇÃO
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_goals_user ON financial_goals(user_id);

-- LÓGICA DE NEGÓCIO (TRIGGER SUGERIDO)
-- Automatizar a entrada no fluxo de caixa quando um serviço é marcado como 'pago'
-- (Implementado via código de aplicação ou Database Triggers)
