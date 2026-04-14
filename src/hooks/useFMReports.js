import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useFMReports() {
  return useQuery({
    queryKey: ['fmReports'],
    queryFn: () => {
      const db = getMockDB()
      return [...db.fmPayoutReports].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    },
  })
}

export function useFMReportEntries(reportId) {
  return useQuery({
    queryKey: ['fmReportEntries', reportId],
    enabled: !!reportId,
    queryFn: () => {
      const db = getMockDB()
      return db.fmReportEntries.filter((e) => e.report_id === reportId)
    },
  })
}

export function useEligiblePayroll() {
  return useQuery({
    queryKey: ['eligiblePayroll'],
    queryFn: () => {
      const db = getMockDB()
      return db.payroll.filter((p) =>
        p.trigger_met && p.admin_approved && p.first_release_status === 'Pending' && !p.fm_report_id
      )
    },
  })
}

export function useEligibleAgentCuts() {
  return useQuery({
    queryKey: ['eligibleAgentCuts'],
    queryFn: () => {
      const db = getMockDB()
      return db.salesAgentCuts.filter((c) => !c.paid && c.cut_amount > 0 && !c.fm_report_id)
    },
  })
}

export function usePendingReport() {
  return useQuery({
    queryKey: ['pendingFMReport'],
    queryFn: () => {
      const db = getMockDB()
      return db.fmPayoutReports.find((r) => r.status === 'submitted') || null
    },
  })
}

export function useSubmitFMReport() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ payoutDate, fmNotes, selectedPayroll, selectedAgentCuts }) => {
      const db = getMockDB()

      const pending = db.fmPayoutReports.find((r) => r.status === 'submitted')
      if (pending) throw new Error('A submitted report already exists. It must be actioned before creating a new one.')

      const totalGross = selectedPayroll.reduce((s, p) => s + Number(p.gross_amount), 0)
      const totalPenalties = selectedPayroll.reduce((s, p) => s + (Number(p.gross_amount) * Number(p.penalty_pct) / 100), 0)
      const totalRelease = selectedPayroll.reduce((s, p) => s + Number(p.first_release), 0)
      const totalRetention = selectedPayroll.reduce((s, p) => s + Number(p.retained_amount), 0)
      const writerIds = [...new Set(selectedPayroll.map((p) => p.writer_id))]

      const reportId = uuid()
      const runNumber = db.fmPayoutReports.length + 1

      const report = {
        id: reportId,
        run_number: runNumber,
        payout_date: payoutDate,
        fm_notes: fmNotes,
        submitted_by: user?.id,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        owner_note: null,
        actioned_by: null,
        actioned_at: null,
        total_gross: totalGross,
        total_penalties: totalPenalties,
        total_release: totalRelease + selectedAgentCuts.reduce((s, c) => s + Number(c.cut_amount), 0),
        total_retention_held: totalRetention,
        writer_count: writerIds.length,
        project_count: selectedPayroll.length,
        user_profiles: { full_name: user?.full_name || 'FM' },
      }
      db.fmPayoutReports.push(report)

      // Snapshot entries
      selectedPayroll.forEach((p) => {
        const writerObj = db.writers.find((w) => w.id === p.writer_id)
        db.fmReportEntries.push({
          id: uuid(),
          report_id: reportId,
          payroll_id: p.id,
          writer_id: p.writer_id,
          client_name: p.clients?.name || '',
          project_name: p.clients?.project_name || '',
          client_type: p.clients?.type || '',
          period: p.period,
          gross_amount: p.gross_amount,
          penalty_pct: p.penalty_pct,
          penalty_reason: p.penalty_reason,
          net_receivable: p.net_receivable,
          first_release: p.first_release,
          retained_amount: p.retained_amount,
          is_retention_release: false,
          writers: writerObj ? { name: writerObj.name } : null,
        })
        // Link payroll to report
        const row = db.payroll.find((r) => r.id === p.id)
        if (row) row.fm_report_id = reportId
      })

      // Link agent cuts
      selectedAgentCuts.forEach((c) => {
        const cut = db.salesAgentCuts.find((sc) => sc.id === c.id)
        if (cut) cut.fm_report_id = reportId
      })

      db.auditLogs.unshift({
        id: uuid(), action: 'submit_fm_report', entity: 'fm_payout_reports', entity_id: reportId,
        description: `FM submitted payout report #${runNumber}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })

      return report
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fmReports'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['eligiblePayroll'] })
      queryClient.invalidateQueries({ queryKey: ['eligibleAgentCuts'] })
      queryClient.invalidateQueries({ queryKey: ['pendingFMReport'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardAlerts'] })
    },
  })
}

export function useActionFMReport() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ reportId, action, ownerNote }) => {
      const db = getMockDB()
      const report = db.fmPayoutReports.find((r) => r.id === reportId)
      if (!report) throw new Error('Report not found')

      const newStatus = action === 'approve' ? 'released' : 'rejected'
      report.status = newStatus
      report.owner_note = ownerNote
      report.actioned_by = user?.id
      report.actioned_at = new Date().toISOString()

      if (action === 'approve') {
        db.payroll.forEach((p) => {
          if (p.fm_report_id === reportId) {
            p.first_release_status = 'Released'
            p.first_released_at = new Date().toISOString()
            p.first_released_by = user?.id
          }
        })
        db.salesAgentCuts.forEach((c) => {
          if (c.fm_report_id === reportId) {
            c.paid = true
            c.paid_at = new Date().toISOString()
            c.paid_by = user?.id
          }
        })
      } else {
        db.payroll.forEach((p) => { if (p.fm_report_id === reportId) p.fm_report_id = null })
        db.salesAgentCuts.forEach((c) => { if (c.fm_report_id === reportId) c.fm_report_id = null })
      }

      db.auditLogs.unshift({
        id: uuid(),
        action: action === 'approve' ? 'approve_fm_report' : 'reject_fm_report',
        entity: 'fm_payout_reports', entity_id: reportId,
        description: `Owner ${action}d FM payout report #${report.run_number}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })

      return report
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fmReports'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['pendingFMReport'] })
      queryClient.invalidateQueries({ queryKey: ['eligiblePayroll'] })
      queryClient.invalidateQueries({ queryKey: ['eligibleAgentCuts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardAlerts'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
