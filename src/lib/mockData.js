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
  { name: 'Maria Clara', contact: '09171111111', type: 'Package', project_name: 'Thesis - Educational Psychology', level: 'Masters', program: 'MA in Education', school: 'PUP', total_amount: 40000, gives: 4, writer_id: 'w-001', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-01-15', due_date: '2026-06-30', latest_deadline: 'June 30', status: 'Active', referral_source: 'YTWmain', package_inclusions: ['Chapters 1-5', 'PPT', 'Tool', 'Statistician and Grammarian', 'AI & Plagiarism Report'], validator_count: 1, extra_rrls_count: 1, revision_notes: 'minor revisions' },
  { name: 'Jose Rizal Jr.', contact: '09172222222', type: 'Regular', project_name: 'Research Paper - Philippine History', level: 'College', program: 'AB History', school: 'UST', total_amount: 15000, gives: 2, writer_id: 'w-002', sales_agent_id: 'a-002', year_batch: 2026, start_date: '2026-02-01', due_date: '2026-04-15', latest_deadline: 'April 15', status: 'Active', referral_source: 'FB Page', referred_by: 'Maria Clara', service_availed: 'RRLs' },
  { name: 'Andres Bonifacio III', contact: '09173333333', type: 'Package', project_name: 'Capstone Project - IT Management', level: 'College', program: 'BS Information Technology', school: 'FEU', total_amount: 50000, gives: 3, writer_id: 'w-003', sales_agent_id: null, year_batch: 2026, start_date: '2026-01-20', due_date: '2026-07-31', latest_deadline: 'July 31', status: 'Active', package_inclusions: ['Chapters 1-5', 'PPT', 'Tool', 'AI & Plagiarism Report', 'Exclusive Defenses and Mock Review'], validator_count: 2, extra_rrls_count: 1, revision_notes: '2 major revisions' },
  { name: 'Gabriela Silang', contact: '09174444444', type: 'Regular', project_name: 'Case Study - Business Ethics', level: 'College', program: 'BS Business Administration', school: 'DLSU', total_amount: 8000, gives: 1, writer_id: 'w-001', sales_agent_id: 'a-003', year_batch: 2026, start_date: '2026-03-01', due_date: '2026-03-30', latest_deadline: 'March 30', status: 'Active', referred_by: 'Emilio Aguinaldo', service_availed: 'revision' },
  { name: 'Emilio Aguinaldo', contact: '09175555555', type: 'Package', project_name: 'Thesis - Public Administration', level: 'PhD', program: 'PhD in Public Administration', school: 'UP Diliman', total_amount: 60000, gives: 2, writer_id: 'w-002', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-01-10', due_date: '2026-08-30', latest_deadline: 'August 30', status: 'Active', referral_source: 'Referral', package_inclusions: ['Chapters 1-5', 'PPT', 'Tool', 'Statistician and Grammarian', 'AI & Plagiarism Report', 'Exclusive Defenses and Mock Review', 'Validator', 'Extra RRLs'], validator_count: 1, extra_rrls_count: 2, revision_notes: 'minor revisions' },
  { name: 'Apolinario Mabini', contact: '09176666666', type: 'Regular', project_name: 'Term Paper - Constitutional Law', level: 'College', program: 'AB Political Science', school: 'Ateneo', total_amount: 12000, gives: 2, writer_id: 'w-003', sales_agent_id: null, year_batch: 2026, start_date: '2026-02-15', due_date: '2026-04-30', latest_deadline: 'April 30', status: 'Active', service_availed: 'RRLs, revision' },
  { name: 'Tandang Sora', contact: '09177777777', type: 'Package', project_name: 'Dissertation Chapter 1-3', level: 'PhD', program: 'PhD in Nursing', school: 'CEU', total_amount: 45000, gives: 4, writer_id: 'w-001', sales_agent_id: 'a-002', year_batch: 2026, start_date: '2026-02-01', due_date: '2026-09-30', latest_deadline: 'September 30', status: 'Active', referral_source: 'YTWmain', package_inclusions: ['Chapters 1-5', 'PPT', 'Statistician and Grammarian', 'AI & Plagiarism Report', 'Validator'], validator_count: 1, extra_rrls_count: 1, revision_notes: 'minor revisions' },
  { name: 'Lapu-Lapu Jr.', contact: '09178888888', type: 'Regular', project_name: 'Reaction Paper - Filipino Literature', level: 'Senior High School', program: 'HUMSS', school: 'Mapua', total_amount: 5000, gives: 1, writer_id: 'w-002', sales_agent_id: 'a-003', year_batch: 2026, start_date: '2026-03-10', due_date: '2026-03-25', latest_deadline: 'March 25', status: 'Active', service_availed: 'revision' },
  { name: 'Sultan Kudarat', contact: '09179999999', type: 'Package', project_name: 'Thesis - Agricultural Science', level: 'Masters', program: 'MS Agriculture', school: 'UPLB', total_amount: 35000, gives: 3, writer_id: 'w-003', sales_agent_id: null, year_batch: 2025, start_date: '2025-09-01', due_date: '2026-05-31', latest_deadline: 'May 31', status: 'Carry-over', is_carry_over: true, package_inclusions: ['Chapters 1-5', 'Tool', 'Statistician and Grammarian'], validator_count: 1, extra_rrls_count: 1, revision_notes: 'major revisions' },
  { name: 'Diego Silang', contact: '09170000000', type: 'Regular', project_name: 'Feasibility Study - Small Business', level: 'College', program: 'BS Entrepreneurship', school: 'TIP', total_amount: 18000, gives: 2, writer_id: 'w-001', sales_agent_id: 'a-001', year_batch: 2026, start_date: '2026-03-05', due_date: '2026-05-15', latest_deadline: 'May 15', status: 'Active', referral_source: 'FB Page', service_availed: 'RRLs' },
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
      referral_source: def.referral_source || null,
      notes: def.notes || null,
      package_inclusions: def.package_inclusions || [],
      validator_count: def.validator_count || 1,
      extra_rrls_count: def.extra_rrls_count || 1,
      revision_notes: def.revision_notes || '',
      service_availed: def.service_availed || '',
      level: def.level || '',
      program: def.program || '',
      latest_deadline: def.latest_deadline || '',
      referred_by: def.referred_by || '',
      added_by: USERS.ops.id,
      completed_at: null,
      created_at: new Date(2026, 0, 1 + idx).toISOString(),
      // Joined relations
      writers: WRITERS.find((w) => w.id === def.writer_id) || null,
      sales_agents: def.sales_agent_id ? SALES_AGENTS.find((a) => a.id === def.sales_agent_id) : null,
    }

    // Generate ONE installment row per client + payment history
    const instId = `inst-${clientId}`
    const payments = []
    let totalPaid = 0

    // Pre-seed some payment records for demo
    if (idx === 0) {
      // Maria Clara: 2 payments made (Give 1 & 2 of 4)
      payments.push(
        { id: `pmt-${clientId}-1`, installment_id: instId, give_number: 1, amount: def.total_amount / def.gives, date_paid: '2026-02-15', recorded_by: USERS.fm.id, recorded_at: '2026-02-15T10:00:00Z' },
        { id: `pmt-${clientId}-2`, installment_id: instId, give_number: 2, amount: def.total_amount / def.gives, date_paid: '2026-02-28', recorded_by: USERS.fm.id, recorded_at: '2026-02-28T14:00:00Z' },
      )
      totalPaid = (def.total_amount / def.gives) * 2
    } else if (idx === 1) {
      // Jose Rizal Jr.: 1 payment made (Give 1 of 2)
      payments.push(
        { id: `pmt-${clientId}-1`, installment_id: instId, give_number: 1, amount: def.total_amount / def.gives, date_paid: '2026-02-20', recorded_by: USERS.fm.id, recorded_at: '2026-02-20T09:00:00Z' },
      )
      totalPaid = def.total_amount / def.gives
    } else if (idx === 3) {
      // Gabriela Silang: fully paid (1 give)
      payments.push(
        { id: `pmt-${clientId}-1`, installment_id: instId, give_number: 1, amount: def.total_amount, date_paid: '2026-03-10', recorded_by: USERS.fm.id, recorded_at: '2026-03-10T14:00:00Z' },
      )
      totalPaid = def.total_amount
    }

    const instStatus = totalPaid >= def.total_amount ? 'Fully Paid' : totalPaid > 0 ? 'Partial' : 'Pending'
    const currentGive = payments.length  // how many gives have been recorded

    installments.push({
      id: instId,
      client_id: clientId,
      total_amount: def.total_amount,
      total_paid: totalPaid,
      gives: def.gives,
      current_give: currentGive,
      status: instStatus,
      updated_at: new Date().toISOString(),
      payments,
      clients: { name: def.name, project_name: def.project_name, type: def.type, total_amount: def.total_amount, status: def.status, writer_id: def.writer_id, writers: client.writers },
    })

    // Generate payroll
    const periods = def.type === 'Package' ? 2 : 1
    const gross = (def.total_amount * 0.30) / periods
    for (let p = 1; p <= periods; p++) {
      const payId = `pay-${clientId}-${p}`
      // Compute trigger_met from installment total_paid
      const inst = installments.find((i) => i.client_id === clientId)
      const totalCollected = inst ? inst.total_paid : 0
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
