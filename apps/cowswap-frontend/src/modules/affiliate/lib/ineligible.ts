import { ReferralVerificationStatus } from '../model/types'

export function getIncomingIneligibleCode(
  incomingCode: string | undefined,
  verification: ReferralVerificationStatus,
): string | undefined {
  if (incomingCode) {
    return incomingCode
  }

  if (verification.kind === 'ineligible') {
    return verification.code
  }

  return undefined
}
