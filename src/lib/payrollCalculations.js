import {
  WRITER_CUT_PCT,
  RETENTION_PCT,
  FIRST_RELEASE_PCT,
  PACKAGE_PERIODS,
  REGULAR_PERIODS,
} from '../utils/constants'

export function calculateWriterCut(totalAmount) {
  return totalAmount * WRITER_CUT_PCT
}

export function getPeriodsForType(clientType) {
  return clientType === 'Package' ? PACKAGE_PERIODS : REGULAR_PERIODS
}

export function calculateGrossPerPeriod(totalAmount, clientType) {
  const writerCut = calculateWriterCut(totalAmount)
  const periods = getPeriodsForType(clientType)
  return writerCut / periods
}

export function calculatePayroll(grossAmount, penaltyPct = 0) {
  const penaltyAmount = grossAmount * (penaltyPct / 100)
  const netReceivable = grossAmount - penaltyAmount
  const firstRelease = netReceivable * FIRST_RELEASE_PCT
  const retainedAmount = netReceivable * RETENTION_PCT

  return {
    grossAmount,
    penaltyPct,
    penaltyAmount,
    netReceivable,
    firstRelease,
    retainedAmount,
  }
}

export function isTriggerMet(totalCollected, totalContract, clientType, period) {
  if (clientType === 'Regular') {
    return totalCollected >= totalContract
  }
  if (period === 1) {
    return totalCollected >= totalContract * 0.50
  }
  return totalCollected >= totalContract
}
