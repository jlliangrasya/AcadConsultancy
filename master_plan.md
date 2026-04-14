# MASTER PLAN — Acad Consultation Management System
> Version 3.0 | Complete system including roles, FM report workflow, sales agent tracking
> This is the single source of truth. Follow phase by phase. Do not skip.

---

## 🏢 BUSINESS CONTEXT

**Business:** Acad Consultation — Academic writing/assistance service
**Scale:** 20–30 new clients per week, 1+ year of history, carry-over clients

### People in the company
| Person | System access | Role in system |
|---|---|---|
| Owner | ✅ Yes | Full access + final approval on payouts |
| Financial Manager (FM) | ✅ Yes | Payments, payroll, penalties, FM reports |
| Operations Manager (Ops) | ✅ Yes | Add/edit/delete clients, assign writers & agents |
| Writers | ❌ No | Tracked as entities — assigned to clients |
| Sales Agents | ❌ No | Tracked as entities — assigned to clients, cut manually set by FM |

---

## 📐 BUSINESS RULES (HARDCODED — NEVER CHANGE)

1. Writer cut = **30%** of total contract amount
2. Package clients → paper split into 2 halves → writer pay split into **2 periods**
3. Regular clients → writer receives pay in **1 phase**
4. Period 1 unlocks when client paid **≥ 50%** of total
5. Period 2 unlocks when client paid **100%** of total
6. Regular writer pay unlocks at **100%** client payment
7. Retention = **10%** of net receivable per period
8. First release = **90%** of net receivable
9. Retained 10% released only after: feedback submitted ✅ + revision done ✅
10. No payment released without **admin approval**
11. Penalty set by FM — deducted from gross before 90/10 split
12. `Net Receivable = Gross − (Gross × Penalty%)`
13. `First Release = Net × 90%`
14. `Retained = Net × 10%`
15. Sales agent cut is **manually set by FM** per client (not a fixed %)
16. FM creates payout report → submits to owner → owner approves → funds released
17. Only one active FM report can exist at a time (must be actioned before new one)

### Payroll Computation Example (Package, ₱40,000)
```
Writer cut     = 40,000 × 30% = 12,000
Period 1 gross = 12,000 / 2   = 6,000
  Penalty 5%   = 6,000 × 5%   = 300
  Net          = 6,000 - 300  = 5,700
  First release= 5,700 × 90%  = 5,130
  Retained     = 5,700 × 10%  = 570

Sales agent cut = set manually by FM (e.g. ₱500 flat or ₱1,000)
```

---

## 🧱 TECH STACK

| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| Data fetching | TanStack Query (React Query) |
| PDF | jsPDF + html2canvas |
| Icons | Lucide React |
| Hosting | Vercel |

---

## 👤 USER ROLES & ACCESS CONTROL

### Role: Owner
- Full read/write access to everything
- Exclusive: approve or reject FM payout reports
- Exclusive: view owner analytics dashboard + P&L
- Exclusive: financial controls (void, adjust, write-off)
- Exclusive: set monthly revenue targets
- Can view all audit logs

### Role: Financial Manager (FM)
- Record client installment payments
- Set penalties (% and reason) per payroll period
- Set sales agent cut per client (manually, any amount)
- Create and submit payout reports to owner
- Mark feedback submitted / revision done (per writer per period)
- Release retention (after feedback + revision confirmed)
- Generate and download payroll slips and FM payout reports
- View all clients, writers, sales agents, payroll
- Cannot: approve payout reports (owner only), delete clients, access owner dashboard

### Role: Operations Manager (Ops)
- **Add** new clients (full form: client info, type, gives, writer, sales agent)
- **Edit** existing clients (any field)
- **Delete/archive** clients (with confirmation)
- View client list, installment status, paper release status
- Cannot: record payments, set penalties, access payroll, access FM report, access owner dashboard

### NOT system users (tracked entities only)
- **Writers** — managed by Ops/FM, assigned to clients, no login
- **Sales Agents** — managed by Ops/FM, assigned to clients, no login

---

## 📁 PROJECT STRUCTURE

```
acad-consultation/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Role-aware nav (shows only allowed pages)
│   │   │   ├── ProtectedRoute.jsx  # Role-gated route wrapper
│   │   │   └── PageHeader.jsx
│   │   ├── clients/
│   │   │   ├── ClientTable.jsx
│   │   │   ├── ClientForm.jsx      # Add/Edit — Ops Manager only
│   │   │   ├── ClientFilters.jsx
│   │   │   └── PaperReleaseCell.jsx
│   │   ├── installments/
│   │   │   ├── InstallmentTable.jsx
│   │   │   ├── InstallmentRow.jsx
│   │   │   └── RecordPaymentModal.jsx   # FM only
│   │   ├── payroll/
│   │   │   ├── PayrollTable.jsx
│   │   │   ├── PayrollRow.jsx
│   │   │   ├── PenaltyInput.jsx         # FM only
│   │   │   ├── PayrollSlipModal.jsx
│   │   │   └── PayrollSlipPDF.jsx
│   │   ├── fm-report/
│   │   │   ├── FMReportBuilder.jsx      # FM only — create/submit report
│   │   │   ├── FMReportHistory.jsx      # FM + Owner
│   │   │   ├── OwnerApprovalPanel.jsx   # Owner only
│   │   │   └── FMReportPDF.jsx
│   │   ├── sales-agents/
│   │   │   ├── AgentTable.jsx
│   │   │   ├── AgentForm.jsx
│   │   │   ├── AgentCutInput.jsx        # FM only — set cut per client
│   │   │   └── AgentSalesModal.jsx      # View agent's clients + earnings
│   │   ├── writers/
│   │   │   ├── WriterTable.jsx
│   │   │   ├── WriterForm.jsx
│   │   │   └── WriterProjectsModal.jsx
│   │   └── dashboard/
│   │       ├── KPICards.jsx
│   │       ├── AlertsPanel.jsx
│   │       ├── RevenueChart.jsx
│   │       ├── ActivityLog.jsx
│   │       └── OwnerAnalytics.jsx       # Owner only
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Clients.jsx
│   │   ├── Installments.jsx             # FM only
│   │   ├── Payroll.jsx                  # FM + Owner
│   │   ├── FMReport.jsx                 # FM (build) + Owner (approve)
│   │   ├── SalesAgents.jsx              # Owner + FM
│   │   ├── Writers.jsx                  # Owner + FM
│   │   └── OwnerDashboard.jsx           # Owner only
│   ├── hooks/
│   │   ├── useClients.js
│   │   ├── useInstallments.js
│   │   ├── usePayroll.js
│   │   ├── useWriters.js
│   │   ├── useSalesAgents.js
│   │   └── useFMReports.js
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── payrollCalculations.js
│   │   └── pdfGenerator.js
│   ├── store/
│   │   └── useAppStore.js              # auth user + role
│   └── utils/
│       ├── formatters.js
│       ├── constants.js
│       └── roleGuards.js               # canDo(role, action) helper
```

---

## 🗃️ DATABASE SCHEMA

### `users` (Supabase auth.users extended)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'fm', 'ops')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `writers`
```sql
CREATE TABLE writers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `sales_agents`
```sql
CREATE TABLE sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `clients`
```sql
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
  added_by UUID REFERENCES user_profiles(id),   -- Ops Manager who added
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `installments`
```sql
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  give_number INT NOT NULL CHECK (give_number BETWEEN 1 AND 4),
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  date_paid DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Paid','Overdue')),
  recorded_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, give_number)
);
```

### `paper_releases`
```sql
CREATE TABLE paper_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period INT NOT NULL CHECK (period IN (1, 2)),
  released BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES user_profiles(id),
  UNIQUE(client_id, period)
);
```

### `payroll`
```sql
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
  fm_report_id UUID,   -- FK to fm_payout_reports (set when included in a run)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, period)
);
```

### `writer_assignments` (reassignment history)
```sql
CREATE TABLE writer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES writers(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,           -- null = currently assigned
  reason TEXT,                          -- reason for reassignment
  amount_received NUMERIC DEFAULT 0,   -- total paid to this writer for this client
  assigned_by UUID REFERENCES user_profiles(id),
  unassigned_by UUID REFERENCES user_profiles(id)
);
```

### `sales_agent_cuts`
```sql
-- One row per client per agent (usually 1 agent per client)
-- Agent commission is per-client, flat amount, set manually by FM
-- Included in the same FM payout report as writer cuts
CREATE TABLE sales_agent_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES sales_agents(id),
  cut_amount NUMERIC NOT NULL DEFAULT 0,   -- manually set by FM, flat amount
  cut_notes TEXT,
  set_by UUID REFERENCES user_profiles(id),
  set_at TIMESTAMPTZ DEFAULT now(),
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES user_profiles(id),
  fm_report_id UUID,    -- FK to fm_payout_reports when included in a run
  UNIQUE(client_id, agent_id)
);
```

### `fm_payout_reports`
```sql
CREATE TABLE fm_payout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number INT GENERATED ALWAYS AS IDENTITY,
  payout_date DATE NOT NULL,
  fm_notes TEXT,
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','released','rejected')),
  owner_note TEXT,
  actioned_by UUID REFERENCES user_profiles(id),  -- owner who approved/rejected
  actioned_at TIMESTAMPTZ,
  total_gross NUMERIC,
  total_penalties NUMERIC,
  total_release NUMERIC,
  total_retention_held NUMERIC,
  writer_count INT,
  project_count INT
);
```

### `fm_report_entries`
```sql
-- Snapshot of each payroll entry included in a payout report
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
```

### `audit_logs`
```sql
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
```

### `expenses` (owner-level)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## ⚙️ DATABASE TRIGGERS

### T1: Auto-generate installments on client insert
```sql
CREATE OR REPLACE FUNCTION generate_installments()
RETURNS TRIGGER AS $$
DECLARE i INT;
BEGIN
  FOR i IN 1..NEW.gives LOOP
    INSERT INTO installments (client_id, give_number, amount_due)
    VALUES (NEW.id, i, NEW.total_amount / NEW.gives);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_installments
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION generate_installments();
```

### T2: Auto-generate payroll rows on client insert
```sql
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
```

### T3: Auto-generate paper_releases on client insert
```sql
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
```

### T4: Auto-generate sales_agent_cuts row when client has agent
```sql
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
```

### T5: Auto-update payroll trigger_met when installment is recorded
```sql
CREATE OR REPLACE FUNCTION check_payroll_trigger()
RETURNS TRIGGER AS $$
DECLARE
  total_contract NUMERIC; total_collected NUMERIC; client_type TEXT;
BEGIN
  SELECT c.total_amount, c.type INTO total_contract, client_type
  FROM clients c WHERE c.id = NEW.client_id;

  SELECT COALESCE(SUM(amount_paid), 0) INTO total_collected
  FROM installments WHERE client_id = NEW.client_id;

  IF client_type = 'Regular' THEN
    UPDATE payroll SET trigger_met = (total_collected >= total_contract)
    WHERE client_id = NEW.client_id AND period = 1;
  ELSE
    UPDATE payroll SET trigger_met = (total_collected >= total_contract * 0.50)
    WHERE client_id = NEW.client_id AND period = 1;
    UPDATE payroll SET trigger_met = (total_collected >= total_contract)
    WHERE client_id = NEW.client_id AND period = 2;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payroll_trigger
AFTER INSERT OR UPDATE ON installments
FOR EACH ROW EXECUTE FUNCTION check_payroll_trigger();
```

---

## 🔐 ROW LEVEL SECURITY

```sql
-- All tables: authenticated users only
-- Role-specific restrictions enforced in application layer via roleGuards.js
-- RLS ensures no public access

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

-- Policy: authenticated users can read/write (role control in app layer)
-- Add Supabase policies per table using auth.uid() and user_profiles.role
```

---

## 📄 KEY FILES

### `src/utils/constants.js`
```javascript
export const WRITER_CUT_PCT = 0.30
export const RETENTION_PCT = 0.10
export const FIRST_RELEASE_PCT = 0.90
export const PACKAGE_PERIODS = 2
export const REGULAR_PERIODS = 1
export const CLIENT_TYPES = ['Regular', 'Package']
export const REGULAR_GIVES = [1, 2]
export const PACKAGE_GIVES = [1, 2, 3, 4]
export const ROLES = { OWNER: 'owner', FM: 'fm', OPS: 'ops' }
export const CLIENT_STATUSES = ['Active','Completed','Overdue','On Hold','Carry-over']
```

### `src/utils/roleGuards.js`
```javascript
import { ROLES } from './constants'

export const PERMISSIONS = {
  add_client:        [ROLES.OPS, ROLES.OWNER],
  edit_client:       [ROLES.OPS, ROLES.OWNER],
  delete_client:     [ROLES.OPS, ROLES.OWNER],
  record_payment:    [ROLES.FM,  ROLES.OWNER],
  set_penalty:       [ROLES.FM,  ROLES.OWNER],
  set_agent_cut:     [ROLES.FM,  ROLES.OWNER],
  approve_payroll:   [ROLES.OWNER],
  release_payroll:   [ROLES.FM,  ROLES.OWNER],
  create_fm_report:  [ROLES.FM],
  approve_fm_report: [ROLES.OWNER],
  view_payroll:      [ROLES.FM,  ROLES.OWNER],
  view_installments: [ROLES.FM,  ROLES.OWNER],
  view_agents:       [ROLES.FM,  ROLES.OWNER],
  view_owner_dash:   [ROLES.OWNER],
  manage_writers:    [ROLES.FM,  ROLES.OWNER, ROLES.OPS],
  manage_agents:     [ROLES.FM,  ROLES.OWNER],
}

export const canDo = (role, action) =>
  PERMISSIONS[action]?.includes(role) ?? false
```

---

## 🖥️ PAGES & ACCESS

| Page | Owner | FM | Ops |
|---|---|---|---|
| Dashboard (operational) | ✅ | ✅ | ✅ (limited) |
| Owner Analytics Dashboard | ✅ | ❌ | ❌ |
| Clients | ✅ full | ✅ view only | ✅ add/edit/delete |
| Installments | ✅ | ✅ record | ❌ |
| Payroll | ✅ approve | ✅ set penalty / release | ❌ |
| FM Payout Report | ✅ approve | ✅ create/submit | ❌ |
| Sales Agents | ✅ | ✅ set cuts | ❌ |
| Writers | ✅ | ✅ | ✅ view |
| Reports & Exports | ✅ | ✅ | ❌ |
| Audit Log | ✅ | ✅ | ❌ |
| Settings / Users | ✅ | ❌ | ❌ |

---

## 🔁 FM PAYOUT REPORT WORKFLOW

```
FM selects eligible payroll entries (trigger_met + approved)
        ↓
FM sets payout date + FM notes
        ↓
FM clicks "Submit to owner"
        ↓ [fm_payout_reports row created, entries snapshot saved]
        ↓
Owner receives notification (in-app alert)
        ↓
Owner reviews report + downloads PDF
        ↓
Owner adds note → clicks "Approve & release" OR "Return to FM"
        ↓ (if approved)
payroll rows updated: first_release_status = 'Released'
fm_payout_reports.status = 'released'
audit log entry created
        ↓ (if rejected)
fm_payout_reports.status = 'rejected'
FM must create a new corrected report
```

**Constraint:** Only 1 report in 'submitted' status at a time.

---

## 💰 SALES AGENT TRACKING

### How it works
1. Ops Manager assigns a sales agent when adding a client
2. FM manually sets the agent's cut amount per client (flat ₱ amount, not %)
3. Cut is tracked in `sales_agent_cuts` table
4. FM marks as paid when the agent has been paid
5. Owner and FM can view each agent's total earnings, pending cuts, paid history

### Sales Agent page shows
- Agent name, contact
- Total clients referred (all time)
- Total earned (sum of paid cuts)
- Pending cuts (set but not yet paid)
- Per-client breakdown: client name, project, cut amount, paid status

### Agent cut is NOT auto-computed
- FM enters a flat peso amount per client
- Can be ₱0 if no commission agreed
- Reason/notes field for context

---

## 📋 CLIENT FORM (Ops Manager)

Fields:
- Client name *
- Contact number
- Client type (Regular / Package) *
- Project/paper name *
- Subject / Course
- School / University
- Total contract amount *
- Number of gives * (1–2 for Regular, 1–4 for Package)
- Assigned writer * (dropdown from writers table)
- Assigned sales agent (dropdown from sales_agents — optional)
- Year/batch (auto-filled, editable)
- Start date
- Due date
- Carry-over flag (checkbox — if Period 1 was in prior year)
- Referral source
- Notes

On submit → DB triggers auto-create: installments, payroll rows, paper_releases, sales_agent_cuts

---

## 📦 BUILD PHASES & CHECKLIST

### PHASE 1 — Project Setup
- [ ] Create Vite + React project
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up full `src/` folder structure
- [ ] Create `.env.local` with Supabase keys
- [ ] Set up `supabase.js`, `constants.js`, `formatters.js`, `roleGuards.js`, `payrollCalculations.js`
- [ ] Set up React Router + React Query + Zustand in `main.jsx`

### PHASE 2 — Supabase Database
- [ ] Create all 10 tables (SQL migrations)
- [ ] Run all 5 triggers
- [ ] Enable RLS on all tables
- [ ] Create seed data: 3 writers, 3 sales agents, 3 system users (owner/fm/ops), 10 clients
- [ ] Test triggers: insert client → verify installments/payroll/paper_releases/agent_cut auto-created

### PHASE 3 — Auth & Roles
- [ ] Build `Login.jsx`
- [ ] On login: fetch `user_profiles` row → store role in Zustand
- [ ] Build `ProtectedRoute.jsx` — redirects if role not allowed
- [ ] Build `roleGuards.js` canDo() helper
- [ ] Apply role guards to all components and pages
- [ ] Test all 3 login roles (owner / fm / ops) — verify access differences

### PHASE 4 — Layout & UI
- [ ] Build role-aware `Navbar.jsx` (shows only permitted nav items per role)
- [ ] Build reusable UI primitives
- [ ] Build `PageHeader.jsx`

### PHASE 5 — Writers & Sales Agents
- [ ] Writers: table, add form, edit, view projects modal, inactive toggle
- [ ] Sales Agents: table, add form, edit, view clients + earnings modal
- [ ] Both: `useWriters.js` and `useSalesAgents.js` hooks

### PHASE 6 — Clients Module (Ops Manager primary)
- [ ] `ClientTable.jsx` — dense, sortable, filterable, paginated
- [ ] `ClientForm.jsx` — full form with writer + agent assignment
- [ ] `ClientFilters.jsx` — search, type, status, writer, agent, year, carry-over
- [ ] `PaperReleaseCell.jsx` — inline mark released
- [ ] Edit and delete (with confirmation) — Ops only
- [ ] `useClients.js` hook
- [ ] Test: Ops can add/edit/delete; FM can only view; Owner can do all

### PHASE 7 — Installments (FM primary)
- [ ] `InstallmentTable.jsx` — dense, all clients, all gives visible
- [ ] `RecordPaymentModal.jsx` — FM records payment
- [ ] Partial payment support
- [ ] `useInstallments.js` with Realtime subscription
- [ ] Filters: status, year, carry-over, writer
- [ ] Test: recording payment → payroll trigger_met auto-updates

### PHASE 8 — Payroll Engine (FM + Owner)
- [ ] `PayrollTable.jsx` — full table
- [ ] `PenaltyInput.jsx` — inline, FM only
- [ ] Approve button — Owner only
- [ ] Release first payment — FM/Owner
- [ ] Mark feedback / revision — FM
- [ ] Release retention — FM/Owner
- [ ] `PayrollSlipModal.jsx` + PDF download
- [ ] `usePayroll.js` hook

### PHASE 9 — Sales Agent Cuts (FM)
- [ ] `AgentCutInput.jsx` — inline editable per client row in payroll/clients
- [ ] Mark agent cut as paid
- [ ] Agent earnings summary in Sales Agents page
- [ ] Per-agent breakdown modal: client, project, cut, paid status

### PHASE 10 — FM Payout Report (FM builds, Owner approves)
- [ ] `FMReportBuilder.jsx` — 3-step builder (date, entries, notes, submit)
- [ ] `FMReportHistory.jsx` — list of past runs
- [ ] `OwnerApprovalPanel.jsx` — owner sees pending, approves/rejects
- [ ] On approval → update payroll rows + log
- [ ] `FMReportPDF.jsx` — downloadable PDF per run
- [ ] Constraint: only 1 submitted report at a time
- [ ] `useFMReports.js` hook

### PHASE 11 — Dashboard
- [ ] Operational dashboard (all roles — filtered by role)
- [ ] KPI cards from real Supabase data
- [ ] Alerts: overdue payments, payroll pending approval, papers not released, FM report pending (owner), agent cuts pending
- [ ] Activity feed from audit_logs
- [ ] Owner-only: analytics panel, revenue chart, P&L summary

### PHASE 12 — Owner Analytics (Owner only)
- [ ] Revenue by month chart
- [ ] Cash in vs. cash out chart
- [ ] Client acquisition rate
- [ ] Writer performance table
- [ ] Sales agent performance table
- [ ] Monthly P&L report generation
- [ ] Revenue target setting + progress

### PHASE 13 — Audit Log
- [ ] `insertAuditLog()` utility — called after every mutation
- [ ] Audit log page — filterable by action, user, date
- [ ] Events logged: client added/edited/deleted, payment recorded, penalty set, payroll approved, released, retention released, FM report submitted/approved/rejected, agent cut set/paid, paper released

### PHASE 14 — Polish & QA
- [ ] Loading skeletons on all tables
- [ ] Toast notifications for all actions
- [ ] Confirmation dialogs for destructive actions
- [ ] Empty states with guidance
- [ ] Pagination (50 rows per page)
- [ ] Row count display ("Showing 24 of 312 clients")
- [ ] Full end-to-end test: Ops adds client → FM records payments → FM sets penalty → Owner approves → FM submits report → Owner approves report → funds released
- [ ] Test all role restrictions (FM cannot add client, Ops cannot see payroll, etc.)

### PHASE 15 — Deployment
- [ ] Push to GitHub
- [ ] Connect Vercel
- [ ] Add env vars in Vercel
- [ ] Set up production Supabase project
- [ ] Seed production with real initial data (past clients, prior runs)

---

---

## 🔄 WRITER REASSIGNMENT FLOW

When a client needs a new writer mid-project:

1. FM or Owner opens client → clicks "Reassign writer"
2. System shows current writer + their payroll status per period:
   - Period 1: Released / Not yet released / In report
   - Period 2: Released / Not yet released / In report
3. Admin selects new writer + enters reason
4. On confirm:
   - Current `writer_assignments` row → `unassigned_at` = now, `amount_received` = sum of all released payments to that writer for this client
   - New `writer_assignments` row inserted with new writer
   - `clients.writer_id` updated to new writer
   - Unreleased `payroll` rows → `writer_id` updated to new writer
   - Already-released payroll rows stay as-is (old writer keeps what was paid)
   - Audit log entry created
5. Assignment history is viewable per client — shows each writer, when assigned/unassigned, and how much they received

**Key rule:** Old writer keeps any already-released payments. New writer inherits only unreleased (pending) payroll rows.

---

## ✅ CLIENT COMPLETION FLOW

When a project is fully done, admin marks it as Completed. System runs a checklist:

```
Before marking Complete, ALL must be true:
  ✅ All installments fully paid (collected = total_amount)
  ✅ All paper releases marked as released (P1 + P2)
  ✅ All writer payroll fully released (first release + retention)
  ✅ All sales agent cuts marked as paid
```

If any item is not done → system shows warning list, blocks completion OR allows override with reason.

On completion:
- `clients.status` = 'Completed'
- `clients.completed_at` = now()
- Audit log entry
- Dashboard completed count updates

**Completion summary** is shown: total collected, total paid to writer, total paid to agent, net margin for this project.

---

## 📋 FM PAYOUT REPORT — INCLUDES AGENTS

The FM payout report covers **both writers AND sales agents** in the same run:

### Report structure:
```
SECTION 1: WRITER PAYOUTS
  Writer: Juan dela Cruz
    - Client A — Period 1 → ₱5,130 (first release)
    - Client B — Retention → ₱570
  Writer subtotal: ₱5,700

  Writer: Ana Gomez
    ...

SECTION 2: SALES AGENT COMMISSIONS
  Agent: Carlo Reyes
    - Client A — Commission → ₱500
    - Client C — Commission → ₱400
  Agent subtotal: ₱900

  Agent: Bea Santos
    ...

GRAND TOTAL
  Total writer payouts:    ₱XX,XXX
  Total agent commissions: ₱X,XXX
  Total retention held:    ₱X,XXX
  TOTAL TO RELEASE:        ₱XX,XXX
```

- Agent cuts are selected alongside payroll entries in the FM report builder
- Same payout date as writers
- On owner approval → both payroll and agent_cuts marked as released/paid
- PDF includes both sections clearly separated

---

## 📄 PDF PAYROLL DOCUMENT

Generated via `jsPDF` + `html2canvas` OR pure `jsPDF` with manual layout.

### PDF sections:
1. **Header** — Business name, "Payroll Run", payout date, run number, generated by
2. **Summary box** — Writers paid, agents paid, projects, total release, retention held
3. **Writer sections** (one per writer, page break between)
   - Writer name header
   - Table: Client | Project | Type | Period | Gross | Penalty | Net | 1st Release | Retention
   - Penalty reason shown if applicable
   - Writer subtotal row
4. **Agent section**
   - Agent name header
   - Table: Client | Project | Commission amount | Notes
   - Agent subtotal
5. **Grand total box** — dark background, all totals
6. **Approval section** — FM submitted by, Owner approved by, date
7. **Footer** — Confidential, page numbers

### Filename: `payroll-run-[RunNumber]-[PayoutDate].pdf`

---

## ⚠️ IMPORTANT NOTES FOR CLAUDE CODE

1. **Never hardcode** financial % — always use `constants.js`
2. **Always call `canDo(role, action)`** before rendering any action button or allowing any mutation
3. **Ops Manager** can ONLY touch the clients page — all other pages must redirect/block them
4. **Sales agent cuts** are flat peso amounts entered manually by FM — never auto-computed
5. **FM report** must snapshot payroll entries at time of submission into `fm_report_entries` — do not reference live payroll rows (they may change)
6. **Only one submitted FM report at a time** — check before allowing FM to submit
7. **trigger_met is auto-updated by DB trigger** — never update from frontend
8. **Computed columns** (net_receivable, first_release, retained_amount) — never update directly
9. **All Supabase calls** go in custom hooks in `src/hooks/`
10. **Audit log** must be written for every data mutation — no exceptions
11. **Writers and Sales Agents are NOT system users** — they have no login, they are data entities
12. **Year/batch tag** must be set on every client for historical filtering
13. **Carry-over clients** need `is_carry_over = true` flag when Period 1 was completed in a prior year
14. **On client delete** — soft delete preferred (status = 'Archived') to preserve financial history
