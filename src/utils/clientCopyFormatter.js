// Bold unicode text helper (Mathematical Bold)
const BOLD_MAP = {
  'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈',
  'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑',
  'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
  'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
  'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
  's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
  '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
}

function bold(text) {
  return text.split('').map((c) => BOLD_MAP[c] || c).join('')
}

function formatAmount(amount) {
  return Number(amount).toLocaleString('en-PH')
}

export function formatClientForCopy(client, installment) {
  const isPackage = client.type === 'Package'
  const totalAmount = Number(client.total_amount)
  const gives = Number(client.gives)
  const perGive = totalAmount / gives

  // Financing plan percentage
  const financingPct = gives > 1 ? `${Math.round(100 / gives)}%` : '100%'

  const lines = []

  // ---- SECTION 1: FINANCING ----
  lines.push(`${bold('FINANCING PLAN')}: ${financingPct}`)
  if (gives > 1) {
    lines.push(`${bold('DP')}: ${formatAmount(perGive)}`)
  }
  lines.push(`${bold('FULL AMOUNT')}: ${formatAmount(totalAmount)}`)

  // Payment schedule
  if (gives > 1) {
    lines.push(`${bold('PAYMENT SCHEDULE DATES')}: (amount-date)`)
    const payments = installment?.payments || []
    for (let i = 2; i <= gives; i++) {
      const existingPayment = payments.find((p) => p.give_number === i)
      if (existingPayment) {
        const dateStr = new Date(existingPayment.date_paid).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })
        lines.push(`* ${ordinal(i)} payment: ${formatAmount(existingPayment.amount)} - ${dateStr}`)
      } else {
        lines.push(`* ${ordinal(i)} payment:`)
      }
    }
  }

  if (client.referral_source) {
    lines.push(` • ${bold('Page source')}: ${client.referral_source}`)
  }
  if (client.referred_by) {
    lines.push(` • ${bold('Referred by')}: ${client.referred_by}`)
  }

  lines.push('')

  // ---- SECTION 2: CLIENT DETAILS ----
  lines.push(`${bold('UP FOR MINE!')} `)
  lines.push(`• ${bold('Type of client (Package or Regular)')}: ${client.type}`)
  if (client.level) lines.push(`• ${bold('Level')}: ${client.level}`)
  if (client.program) lines.push(`• ${bold('Course')}: ${client.program}`)
  lines.push(`• ${bold('Client FB name')}:  ${client.name}`)
  if (client.latest_deadline) lines.push(`• ${bold('Latest deadline')}:  ${client.latest_deadline}`)

  if (isPackage) {
    // Package inclusions
    if (client.package_inclusions && client.package_inclusions.length > 0) {
      lines.push(`• ${bold('List of inclusions')}: `)
      client.package_inclusions.forEach((item) => {
        if (item === 'Validator') {
          lines.push(`•\t${client.validator_count || 1} Validator`)
        } else if (item === 'Extra RRLs') {
          lines.push(`•\t${client.extra_rrls_count || 1} Extra RRLs`)
        } else {
          lines.push(`•\t${item}`)
        }
      })
    }
    lines.push(`• ${bold('Package #')}: ${gives}`)
    if (client.revision_notes) {
      lines.push(`• ${bold('# of Revisions')}:  ${client.revision_notes}`)
    }
  } else {
    // Regular
    if (client.service_availed) {
      lines.push(`• ${bold('Service availed')}: ${client.service_availed}`)
    }
  }

  return lines.join('\n')
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
