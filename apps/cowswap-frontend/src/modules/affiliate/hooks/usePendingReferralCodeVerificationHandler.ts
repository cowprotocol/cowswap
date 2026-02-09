import { useEffect } from 'react'

import type { TraderReferralCodeContextValue } from '../lib/affiliateProgramTypes'

interface PendingVerificationParams {
  traderReferralCode: TraderReferralCodeContextValue
  runVerification: (code: string) => Promise<void>
}

export function usePendingReferralCodeVerificationHandler(params: PendingVerificationParams): void {
  const { traderReferralCode, runVerification } = params
  const { pendingVerificationRequest, actions, inputCode, savedCode } = traderReferralCode

  useEffect(() => {
    if (!pendingVerificationRequest) {
      return
    }

    const { id, code } = pendingVerificationRequest
    const candidate = code ?? inputCode ?? savedCode

    if (!candidate) {
      actions.clearPendingVerification(id)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        await runVerification(candidate)
      } finally {
        if (!cancelled) {
          actions.clearPendingVerification(id)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [actions, inputCode, pendingVerificationRequest, runVerification, savedCode])
}
