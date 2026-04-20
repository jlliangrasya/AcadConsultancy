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
  view_leads:        [ROLES.OPS, ROLES.FM, ROLES.OWNER],
  manage_leads:      [ROLES.OPS, ROLES.FM, ROLES.OWNER],
  view_expenses:     [ROLES.FM,  ROLES.OWNER],
  manage_expenses:   [ROLES.FM,  ROLES.OWNER],
  complete_client:   [ROLES.FM,  ROLES.OWNER],
  reassign_writer:   [ROLES.FM,  ROLES.OWNER],
  run_carry_over:    [ROLES.OPS, ROLES.OWNER],
}

export const canDo = (role, action) =>
  PERMISSIONS[action]?.includes(role) ?? false
