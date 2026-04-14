-- ============================================================
-- Acad Consultation Management System — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ========================
-- 1. TABLES
-- ========================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'fm', 'ops')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Writers (tracked entities, no login)
CREATE TABLE writers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales agents (tracked entities, no login)
CREATE TABLE sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  type TEXT NOT NULL CHECK (type IN ('Regular', 'Package')),
  project_name TEXT NOT NULL,
  subject TEXT,
  school TEXT,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  gives INT NOT NULL CHECK (
    (type = 'Regular' AND gives IN (1, 2)) OR
    (type = 'Package' AND gives IN (1, 2, 3, 4))
  ),
  writer_id UUID REFERENCES writers(id),
  sales_agent_id UUID REFERENCES sales_agents(id),
  year_batch INT DEFAULT EXTRACT(YEAR FROM now()),
  start_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Completed','Overdue','On Hold','Carry-over')),
  is_carry_over BOOLEAN DEFAULT false,
  referral_source TEXT,
  notes TEXT,
  added_by UUID REFERENCES user_profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Installments (one row per client — payment history in separate table)
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  total_paid NUMERIC DEFAULT 0,
  gives INT NOT NULL CHECK (gives BETWEEN 1 AND 4),
  current_give INT DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Partial','Fully Paid','Overdue')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id)
);

-- Payment records (one row per give payment)
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
  give_number INT NOT NULL CHECK (give_number BETWEEN 1 AND 4),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date_paid DATE NOT NULL,
  recorded_by UUID REFERENCES user_profiles(id),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Paper releases
CREATE TABLE paper_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period INT NOT NULL CHECK (period IN (1, 2)),
  released BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES user_profiles(id),
  UNIQUE(client_id, period)
);

-- FM payout reports (created before payroll FK reference)
CREATE TABLE fm_payout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number INT GENERATED ALWAYS AS IDENTITY,
  payout_date DATE NOT NULL,
  fm_notes TEXT,
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','released','rejected')),
  owner_note TEXT,
  actioned_by UUID REFERENCES user_profiles(id),
  actioned_at TIMESTAMPTZ,
  total_gross NUMERIC,
  total_penalties NUMERIC,
  total_release NUMERIC,
  total_retention_held NUMERIC,
  writer_count INT,
  project_count INT
);

-- Payroll
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES writers(id),
  period INT NOT NULL CHECK (period IN (1, 2)),
  gross_amount NUMERIC NOT NULL,
  penalty_pct NUMERIC DEFAULT 0 CHECK (penalty_pct BETWEEN 0 AND 100),
  penalty_reason TEXT,
  penalty_set_by UUID REFERENCES user_profiles(id),
  penalty_set_at TIMESTAMPTZ,
  net_receivable NUMERIC GENERATED ALWAYS AS (
    gross_amount - (gross_amount * penalty_pct / 100)
  ) STORED,
  first_release NUMERIC GENERATED ALWAYS AS (
    (gross_amount - (gross_amount * penalty_pct / 100)) * 0.90
  ) STORED,
  retained_amount NUMERIC GENERATED ALWAYS AS (
    (gross_amount - (gross_amount * penalty_pct / 100)) * 0.10
  ) STORED,
  trigger_met BOOLEAN DEFAULT false,
  admin_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  first_release_status TEXT DEFAULT 'Pending' CHECK (first_release_status IN ('Pending','Released')),
  first_released_at TIMESTAMPTZ,
  first_released_by UUID REFERENCES user_profiles(id),
  retention_status TEXT DEFAULT 'Holding' CHECK (retention_status IN ('Holding','Released')),
  retention_released_at TIMESTAMPTZ,
  retention_released_by UUID REFERENCES user_profiles(id),
  feedback_submitted BOOLEAN DEFAULT false,
  revision_done BOOLEAN DEFAULT false,
  fm_report_id UUID REFERENCES fm_payout_reports(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, period)
);

-- Writer assignments (reassignment history)
CREATE TABLE writer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES writers(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  reason TEXT,
  amount_received NUMERIC DEFAULT 0,
  assigned_by UUID REFERENCES user_profiles(id),
  unassigned_by UUID REFERENCES user_profiles(id)
);

-- Sales agent cuts
CREATE TABLE sales_agent_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES sales_agents(id),
  cut_amount NUMERIC NOT NULL DEFAULT 0,
  cut_notes TEXT,
  set_by UUID REFERENCES user_profiles(id),
  set_at TIMESTAMPTZ DEFAULT now(),
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES user_profiles(id),
  fm_report_id UUID REFERENCES fm_payout_reports(id),
  UNIQUE(client_id, agent_id)
);

-- FM report entries (snapshot)
CREATE TABLE fm_report_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES fm_payout_reports(id) ON DELETE CASCADE,
  payroll_id UUID REFERENCES payroll(id),
  writer_id UUID REFERENCES writers(id),
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  client_type TEXT NOT NULL,
  period INT NOT NULL,
  gross_amount NUMERIC NOT NULL,
  penalty_pct NUMERIC DEFAULT 0,
  penalty_reason TEXT,
  net_receivable NUMERIC NOT NULL,
  first_release NUMERIC NOT NULL,
  retained_amount NUMERIC NOT NULL,
  is_retention_release BOOLEAN DEFAULT false
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses (owner-level)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ========================
-- 2. TRIGGERS
-- ========================

-- T1: Auto-generate ONE installment row per client on insert
CREATE OR REPLACE FUNCTION generate_installments()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO installments (client_id, total_amount, gives)
  VALUES (NEW.id, NEW.total_amount, NEW.gives);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_installments
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION generate_installments();

-- T2: Auto-generate payroll rows on client insert
CREATE OR REPLACE FUNCTION generate_payroll()
RETURNS TRIGGER AS $$
DECLARE periods INT; gross NUMERIC; i INT;
BEGIN
  periods := CASE WHEN NEW.type = 'Package' THEN 2 ELSE 1 END;
  gross := (NEW.total_amount * 0.30) / periods;
  FOR i IN 1..periods LOOP
    INSERT INTO payroll (client_id, writer_id, period, gross_amount)
    VALUES (NEW.id, NEW.writer_id, i, gross);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payroll
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION generate_payroll();

-- T3: Auto-generate paper_releases on client insert
CREATE OR REPLACE FUNCTION generate_paper_releases()
RETURNS TRIGGER AS $$
DECLARE periods INT; i INT;
BEGIN
  periods := CASE WHEN NEW.type = 'Package' THEN 2 ELSE 1 END;
  FOR i IN 1..periods LOOP
    INSERT INTO paper_releases (client_id, period) VALUES (NEW.id, i);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_paper_releases
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION generate_paper_releases();

-- T4: Auto-generate sales_agent_cuts row when client has agent
CREATE OR REPLACE FUNCTION generate_agent_cut()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sales_agent_id IS NOT NULL THEN
    INSERT INTO sales_agent_cuts (client_id, agent_id, cut_amount)
    VALUES (NEW.id, NEW.sales_agent_id, 0)
    ON CONFLICT (client_id, agent_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_cut
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION generate_agent_cut();

-- T5: Auto-update payroll trigger_met when installment total_paid changes
CREATE OR REPLACE FUNCTION check_payroll_trigger()
RETURNS TRIGGER AS $$
DECLARE
  total_contract NUMERIC; total_collected NUMERIC; client_type TEXT;
  v_client_id UUID;
BEGIN
  v_client_id := NEW.client_id;
  SELECT c.total_amount, c.type INTO total_contract, client_type
  FROM clients c WHERE c.id = v_client_id;

  total_collected := NEW.total_paid;

  IF client_type = 'Regular' THEN
    UPDATE payroll SET trigger_met = (total_collected >= total_contract)
    WHERE client_id = v_client_id AND period = 1;
  ELSE
    UPDATE payroll SET trigger_met = (total_collected >= total_contract * 0.50)
    WHERE client_id = v_client_id AND period = 1;
    UPDATE payroll SET trigger_met = (total_collected >= total_contract)
    WHERE client_id = v_client_id AND period = 2;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payroll_trigger
AFTER UPDATE OF total_paid ON installments
FOR EACH ROW EXECUTE FUNCTION check_payroll_trigger();


-- ========================
-- 3. ROW LEVEL SECURITY
-- ========================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agent_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fm_payout_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fm_report_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read and write all tables
-- Role-specific restrictions are enforced in the application layer via roleGuards.js
CREATE POLICY "Authenticated users can read user_profiles"
  ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Authenticated users full access to writers"
  ON writers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to sales_agents"
  ON sales_agents FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to clients"
  ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to installments"
  ON installments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to paper_releases"
  ON paper_releases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to payroll"
  ON payroll FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to writer_assignments"
  ON writer_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to payment_records"
  ON payment_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to sales_agent_cuts"
  ON sales_agent_cuts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to fm_payout_reports"
  ON fm_payout_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to fm_report_entries"
  ON fm_report_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to audit_logs"
  ON audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to expenses"
  ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
