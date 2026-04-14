import { supabase } from './supabase'

export async function insertAuditLog({
  action,
  entity,
  entityId,
  description,
  oldValue = null,
  newValue = null,
  performedBy,
}) {
  const { error } = await supabase.from('audit_logs').insert({
    action,
    entity,
    entity_id: entityId,
    description,
    old_value: oldValue,
    new_value: newValue,
    performed_by: performedBy,
  })
  if (error) console.error('Audit log error:', error)
}
