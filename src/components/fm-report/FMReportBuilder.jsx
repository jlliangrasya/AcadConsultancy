import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency } from '../../utils/formatters'
import { useEligiblePayroll, useEligibleAgentCuts, useSubmitFMReport } from '../../hooks/useFMReports'
import { useToast } from '../ui/Toast'

export default function FMReportBuilder() {
  const toast = useToast()
  const { data: eligiblePayroll, isLoading: loadingPayroll } = useEligiblePayroll()
  const { data: eligibleAgentCuts, isLoading: loadingCuts } = useEligibleAgentCuts()
  const submitReport = useSubmitFMReport()

  const [step, setStep] = useState(1)
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0])
  const [fmNotes, setFmNotes] = useState('')
  const [selectedPayrollIds, setSelectedPayrollIds] = useState(new Set())
  const [selectedCutIds, setSelectedCutIds] = useState(new Set())

  const togglePayroll = (id) => {
    setSelectedPayrollIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleCut = (id) => {
    setSelectedCutIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedPayroll = (eligiblePayroll || []).filter((p) => selectedPayrollIds.has(p.id))
  const selectedAgentCuts = (eligibleAgentCuts || []).filter((c) => selectedCutIds.has(c.id))

  const totalRelease = selectedPayroll.reduce((s, p) => s + Number(p.first_release), 0)
  const totalAgentCuts = selectedAgentCuts.reduce((s, c) => s + Number(c.cut_amount), 0)

  const handleSubmit = async () => {
    if (selectedPayroll.length === 0 && selectedAgentCuts.length === 0) {
      toast.warning('Select at least one payroll entry or agent cut')
      return
    }
    try {
      await submitReport.mutateAsync({
        payoutDate,
        fmNotes,
        selectedPayroll,
        selectedAgentCuts,
      })
      toast.success('FM Report submitted to owner')
      setStep(1)
      setSelectedPayrollIds(new Set())
      setSelectedCutIds(new Set())
      setFmNotes('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loadingPayroll || loadingCuts) {
    return <div className="text-gray-500">Loading eligible entries...</div>
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              step === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Step {s}: {s === 1 ? 'Select Entries' : s === 2 ? 'Set Date & Notes' : 'Review & Submit'}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Writer Payroll Entries (trigger met + approved)</h3>
            <Table>
              <Thead>
                <tr>
                  <Th className="w-8"></Th>
                  <Th>Client</Th>
                  <Th>Project</Th>
                  <Th>Writer</Th>
                  <Th>Period</Th>
                  <Th>1st Release</Th>
                </tr>
              </Thead>
              <Tbody>
                {(!eligiblePayroll || eligiblePayroll.length === 0) ? (
                  <EmptyRow colSpan={6} message="No eligible payroll entries" />
                ) : (
                  eligiblePayroll.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => togglePayroll(p.id)}>
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedPayrollIds.has(p.id)}
                          onChange={() => togglePayroll(p.id)}
                          className="rounded border-gray-300"
                        />
                      </Td>
                      <Td>{p.clients?.name}</Td>
                      <Td>{p.clients?.project_name}</Td>
                      <Td>{p.writers?.name}</Td>
                      <Td>P{p.period}</Td>
                      <Td>{formatCurrency(p.first_release)}</Td>
                    </tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sales Agent Commissions (unpaid)</h3>
            <Table>
              <Thead>
                <tr>
                  <Th className="w-8"></Th>
                  <Th>Agent</Th>
                  <Th>Client</Th>
                  <Th>Project</Th>
                  <Th>Cut Amount</Th>
                </tr>
              </Thead>
              <Tbody>
                {(!eligibleAgentCuts || eligibleAgentCuts.length === 0) ? (
                  <EmptyRow colSpan={5} message="No eligible agent cuts" />
                ) : (
                  eligibleAgentCuts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleCut(c.id)}>
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedCutIds.has(c.id)}
                          onChange={() => toggleCut(c.id)}
                          className="rounded border-gray-300"
                        />
                      </Td>
                      <Td>{c.sales_agents?.name}</Td>
                      <Td>{c.clients?.name}</Td>
                      <Td>{c.clients?.project_name}</Td>
                      <Td>{formatCurrency(c.cut_amount)}</Td>
                    </tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={selectedPayrollIds.size === 0 && selectedCutIds.size === 0}>
              Next: Set Date & Notes
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-md space-y-4">
          <Input
            label="Payout Date *"
            type="date"
            value={payoutDate}
            onChange={(e) => setPayoutDate(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">FM Notes</label>
            <textarea
              value={fmNotes}
              onChange={(e) => setFmNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional notes for the owner..."
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Next: Review</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p><span className="text-gray-500">Payout Date:</span> <strong>{payoutDate}</strong></p>
            <p><span className="text-gray-500">Writer entries:</span> <strong>{selectedPayroll.length}</strong></p>
            <p><span className="text-gray-500">Agent cuts:</span> <strong>{selectedAgentCuts.length}</strong></p>
            <p><span className="text-gray-500">Total writer release:</span> <strong>{formatCurrency(totalRelease)}</strong></p>
            <p><span className="text-gray-500">Total agent commissions:</span> <strong>{formatCurrency(totalAgentCuts)}</strong></p>
            <p><span className="text-gray-500">Grand total to release:</span> <strong className="text-lg">{formatCurrency(totalRelease + totalAgentCuts)}</strong></p>
            {fmNotes && <p><span className="text-gray-500">Notes:</span> {fmNotes}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleSubmit} loading={submitReport.isPending}>
              Submit to Owner
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
