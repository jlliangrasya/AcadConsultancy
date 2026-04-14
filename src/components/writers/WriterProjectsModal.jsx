import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency } from '../../utils/formatters'

export default function WriterProjectsModal({ writer, open, onClose }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['writerProjects', writer?.id],
    enabled: !!writer?.id && open,
    queryFn: () => {
      const db = getMockDB()
      return db.payroll.filter((p) => p.writer_id === writer.id)
    },
  })

  return (
    <Modal open={open} onClose={onClose} title={`Projects — ${writer?.name}`} size="lg">
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <Table>
          <Thead>
            <tr><Th>Client</Th><Th>Project</Th><Th>Type</Th><Th>Period</Th><Th>Gross</Th><Th>Status</Th></tr>
          </Thead>
          <Tbody>
            {(!projects || projects.length === 0) ? (
              <EmptyRow colSpan={6} message="No projects assigned" />
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <Td className="font-medium">{p.clients?.name}</Td>
                  <Td>{p.clients?.project_name}</Td>
                  <Td><Badge>{p.clients?.type}</Badge></Td>
                  <Td>Period {p.period}</Td>
                  <Td>{formatCurrency(p.gross_amount)}</Td>
                  <Td><Badge>{p.first_release_status}</Badge></Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </Modal>
  )
}
