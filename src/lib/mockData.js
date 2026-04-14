// ============================================================
// Mock Data Store — Full in-memory database for demo mode
// ============================================================

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// ---- Users ----
const USERS = {
  owner: { id: 'u-owner-001', email: 'owner@acad.com', full_name: 'Grace Burila', role: 'owner' },
  fm: { id: 'u-fm-001', email: 'fm@acad.com', full_name: 'Finance Manager', role: 'fm' },
  ops: { id: 'u-ops-001', email: 'ops@acad.com', full_name: 'Operations Manager', role: 'ops' },
}

// ---- Writers ----
const WRITERS = [
  { id: 'w-001', name: 'Juan dela Cruz', email: 'juan@email.com', contact: '09171234567', status: 'active', created_at: '2025-06-01T00:00:00Z' },
  { id: 'w-002', name: 'Ana Gomez', email: 'ana@email.com', contact: '09182345678', status: 'active', created_at: '2025-06-01T00:00:00Z' },
  { id: 'w-003', name: 'Mark Reyes', email: 'mark@email.com', contact: '09193456789', status: 'active', created_at: '2025-06-01T00:00:00Z' },
]

// ---- Sales Agents ----
const SALES_AGENTS = [
  { id: 'a-001', name: 'Carlo Santos', email: 'carlo@email.com', contact: '09201234567', status: 'active', created_at: '2025-06-01T00:00:00Z' },
  { id: 'a-002', name: 'Bea Reyes', email: 'bea@email.com', contact: '09212345678', status: 'active', created_at: '2025-06-01T00:00:00Z' },
  { id: 'a-003', name: 'David Cruz', email: 'david@email.com', contact: '09223456789', status: 'active', created_at: '2025-06-01T00:00:00Z' },
]

// ---- Clients (10 sample) ----
const CLIENT_DEFS = [
  { name: 'Maria Clara', contact: '09171111111', type: 'Package', project_name: 'Thesis - Educational Psychology', subject: 'Education', school: 'PUP', total_amount: 40000, gives: 4, writer_id: 'w-001', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-01-15', due_date: '2026-06-30', status: 'Active' },
  { name: 'Jose Rizal Jr.', contact: '09172222222', type: 'Regular', project_name: 'Research Paper - Philippine History', subject: 'History', school: 'UST', total_amount: 15000, gives: 2, writer_id: 'w-002', sales_agent_id: 'a-002', year_batch: 2026, start_date: '2026-02-01', due_date: '2026-04-15', status: 'Active' },
  { name: 'Andres Bonifacio III', contact: '09173333333', type: 'Package', project_name: 'Capstone Project - IT Management', subject: 'Information Technology', school: 'FEU', total_amount: 50000, gives: 3, writer_id: 'w-003', sales_agent_id: null, year_batch: 2026, start_date: '2026-01-20', due_date: '2026-07-31', status: 'Active' },
  { name: 'Gabriela Silang', contact: '09174444444', type: 'Regular', project_name: 'Case Study - Business Ethics', subject: 'Business', school: 'DLSU', total_amount: 8000, gives: 1, writer_id: 'w-001', sales_agent_id: 'a-003', year_batch: 2026, start_date: '2026-03-01', due_date: '2026-03-30', status: 'Active' },
  { name: 'Emilio Aguinaldo', contact: '09175555555', type: 'Package', project_name: 'Thesis - Public Administration', subject: 'Political Science', school: 'UP Diliman', total_amount: 60000, gives: 2, writer_id: 'w-002', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-01-10', due_date: '2026-08-30', status: 'Active' },
  { name: 'Apolinario Mabini', contact: '09176666666', type: 'Regular', project_name: 'Term Paper - Constitutional Law', subject: 'Law', school: 'Ateneo', total_amount: 12000, gives: 2, writer_id: 'w-003', sales_agent_id: null, year_batch: 2026, start_date: '2026-02-15', due_date: '2026-04-30', status: 'Active' },
  { name: 'Tandang Sora', contact: '09177777777', type: 'Package', project_name: 'Dissertation Chapter 1-3', subject: 'Nursing', school: 'CEU', total_amount: 45000, gives: 4, writer_id: 'w-001', sales_agent_id: 'a-002', year_batch: 2026, start_date: '2026-02-01', due_date: '2026-09-30', status: 'Active' },
  { name: 'Lapu-Lapu Jr.', contact: '09178888888', type: 'Regular', project_name: 'Reaction Paper - Filipino Literature', subject: 'Filipino', school: 'Mapua', total_amount: 5000, gives: 1, writer_id: 'w-002', sales_agent_id: 'a-003', year_batch: 2026, start_date: '2026-03-10', due_date: '2026-03-25', status: 'Active' },
  { name: 'Sultan Kudarat', contact: '09179999999', type: 'Package', project_name: 'Thesis - Agricultural Science', subject: 'Agriculture', school: 'UPLB', total_amount: 35000, gives: 3, writer_id: 'w-003', sales_agent_id: null, year_batch: 2025, start_date: '2025-09-01', due_date: '2026-05-31', status: 'Carry-over', is_carry_over: true },
  { name: 'Diego Silang', contact: '09170000000', type: 'Regular', project_name: 'Feasibility Study - Small Business', subject: 'Entrepreneurship', school: 'TIP', total_amount: 18000, gives: 2, writer_id: 'w-001', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-03-05', due_date: '2026-05-15', status: 'Active' },
]

// Build derived data
function buildMockDB() {
  const clients = []
  const installments = []
  const payroll = []
  const paperReleases = []
  const salesAgentCuts = []
  const auditLogs = []
  const fmPayoutReports = []
  const fmReportEntries = []

  CLIENT_DEFS.forEach((def, idx) => {
    const clientId = `c-${String(idx + 1).padStart(3, '0')}`
    const client = {
      id: clientId,
      ...def,
      is_carry_over: def.is_carry_over || false,
      referral_source: null,
      notes: null,
      added_by: USERS.ops.id,
      completed_at: null,
      created_at: new Date(2026, 0, 1 + idx).toISOString(),
      // Joined relations
      writers: WRITERS.find((w) => w.id === def.writer_id) || null,
      sales_agents: def.sales_agent_id ? SALES_AGENTS.find((a) => a.id === def.sales_agent_id) : null,
    }

    // Generate installments
    for (let i = 1; i <= def.gives; i++) {
      const instId = `inst-${clientId}-${i}`
      const amountDue = def.total_amount / def.gives
      // Pre-pay some for demo: first 3 clients have some payments
      let amountPaid = 0
      let status = 'Pending'
      let datePaid = null
      if (idx === 0 && i <= 2) { amountPaid = amountDue; status = 'Paid'; datePaid = '2026-02-15' }
      if (idx === 1 && i === 1) { amountPaid = amountDue; status = 'Paid'; datePaid = '2026-02-20' }
      if (idx === 3) { amountPaid = amountDue; status = 'Paid'; datePaid = '2026-03-10' }

      installments.push({
        id: instId,
        client_id: clientId,
        give_number: i,
        amount_due: amountDue,
        amount_paid: amountPaid,
        date_paid: datePaid,
        status,
        recorded_by: amountPaid > 0 ? USERS.fm.id : null,
        updated_at: new Date().toISOString(),
        clients: { name: def.name, project_name: def.project_name, type: def.type, total_amount: def.total_amount, status: def.status, writer_id: def.writer_id, writers: client.writers },
      })
    }

    // Generate payroll
    const periods = def.type === 'Package' ? 2 : 1
    const gross = (def.total_amount * 0.30) / periods
    for (let p = 1; p <= periods; p++) {
      const payId = `pay-${clientId}-${p}`
      // Compute trigger_met from installment payments
      const totalCollected = installments.filter((i) => i.client_id === clientId).reduce((s, i) => s + i.amount_paid, 0)
      let triggerMet = false
      if (def.type === 'Regular') triggerMet = totalCollected >= def.total_amount
      else if (p === 1) triggerMet = totalCollected >= def.total_amount * 0.50
      else triggerMet = totalCollected >= def.total_amount

      const penaltyPct = idx === 0 && p === 1 ? 5 : 0
      const penaltyReason = idx === 0 && p === 1 ? 'Late submission' : null
      const net = gross - (gross * penaltyPct / 100)

      payroll.push({
        id: payId,
        client_id: clientId,
        writer_id: def.writer_id,
        period: p,
        gross_amount: gross,
        penalty_pct: penaltyPct,
        penalty_reason: penaltyReason,
        penalty_set_by: penaltyPct > 0 ? USERS.fm.id : null,
        penalty_set_at: penaltyPct > 0 ? '2026-03-01T00:00:00Z' : null,
        net_receivable: net,
        first_release: net * 0.90,
        retained_amount: net * 0.10,
        trigger_met: triggerMet,
        admin_approved: idx === 3,
        approved_by: idx === 3 ? USERS.owner.id : null,
        approved_at: idx === 3 ? '2026-03-12T00:00:00Z' : null,
        first_release_status: 'Pending',
        first_released_at: null,
        first_released_by: null,
        retention_status: 'Holding',
        retention_released_at: null,
        retention_released_by: null,
        feedback_submitted: false,
        revision_done: false,
        fm_report_id: null,
        created_at: new Date(2026, 0, 1 + idx).toISOString(),
        clients: { name: def.name, project_name: def.project_name, type: def.type, total_amount: def.total_amount, status: def.status },
        writers: WRITERS.find((w) => w.id === def.writer_id),
      })
    }

    // Generate paper releases
    for (let p = 1; p <= periods; p++) {
      paperReleases.push({
        id: `pr-${clientId}-${p}`,
        client_id: clientId,
        period: p,
        released: false,
        released_at: null,
        released_by: null,
      })
    }

    // Attach paper_releases to client
    client.paper_releases = paperReleases.filter((pr) => pr.client_id === clientId)

    clients.push(client)

    // Generate agent cut row
    if (def.sales_agent_id) {
      salesAgentCuts.push({
        id: `sac-${clientId}`,
        client_id: clientId,
        agent_id: def.sales_agent_id,
        cut_amount: [500, 1000, 750, 600, 800][idx % 5],
        cut_notes: null,
        set_by: USERS.fm.id,
        set_at: new Date(2026, 0, 5 + idx).toISOString(),
        paid: false,
        paid_at: null,
        paid_by: null,
        fm_report_id: null,
        clients: { name: def.name, project_name: def.project_name, type: def.type, status: def.status },
        sales_agents: SALES_AGENTS.find((a) => a.id === def.sales_agent_id),
      })
    }
  })

  // Sample audit logs
  auditLogs.push(
    { id: 'log-001', action: 'create', entity: 'client', entity_id: 'c-001', description: 'Added client: Maria Clara — Thesis - Educational Psychology', old_value: null, new_value: null, performed_by: USERS.ops.id, created_at: '2026-01-02T09:00:00Z', user_profiles: { full_name: USERS.ops.full_name } },
    { id: 'log-002', action: 'record_payment', entity: 'installment', entity_id: 'inst-c-001-1', description: 'Recorded payment of ₱10,000 for give #1', old_value: null, new_value: null, performed_by: USERS.fm.id, created_at: '2026-02-15T10:00:00Z', user_profiles: { full_name: USERS.fm.full_name } },
    { id: 'log-003', action: 'record_payment', entity: 'installment', entity_id: 'inst-c-001-2', description: 'Recorded payment of ₱10,000 for give #2', old_value: null, new_value: null, performed_by: USERS.fm.id, created_at: '2026-02-15T10:05:00Z', user_profiles: { full_name: USERS.fm.full_name } },
    { id: 'log-004', action: 'set_penalty', entity: 'payroll', entity_id: 'pay-c-001-1', description: 'Set penalty 5% — Late submission', old_value: null, new_value: null, performed_by: USERS.fm.id, created_at: '2026-03-01T11:00:00Z', user_profiles: { full_name: USERS.fm.full_name } },
    { id: 'log-005', action: 'create', entity: 'client', entity_id: 'c-004', description: 'Added client: Gabriela Silang — Case Study - Business Ethics', old_value: null, new_value: null, performed_by: USERS.ops.id, created_at: '2026-03-01T08:00:00Z', user_profiles: { full_name: USERS.ops.full_name } },
    { id: 'log-006', action: 'record_payment', entity: 'installment', entity_id: 'inst-c-004-1', description: 'Recorded payment of ₱8,000 for give #1', old_value: null, new_value: null, performed_by: USERS.fm.id, created_at: '2026-03-10T14:00:00Z', user_profiles: { full_name: USERS.fm.full_name } },
    { id: 'log-007', action: 'approve_payroll', entity: 'payroll', entity_id: 'pay-c-004-1', description: 'Owner approved payroll for release', old_value: null, new_value: null, performed_by: USERS.owner.id, created_at: '2026-03-12T09:00:00Z', user_profiles: { full_name: USERS.owner.full_name } },
  )

  return {
    users: USERS,
    writers: [...WRITERS],
    salesAgents: [...SALES_AGENTS],
    clients,
    installments,
    payroll,
    paperReleases,
    salesAgentCuts,
    auditLogs,
    fmPayoutReports,
    fmReportEntries,
    expenses: [],
  }
}

// Singleton mutable store
let _db = null
export function getMockDB() {
  if (!_db) _db = buildMockDB()
  return _db
}

export function resetMockDB() {
  _db = buildMockDB()
  return _db
}

export { uuid, USERS }
