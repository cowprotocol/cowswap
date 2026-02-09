import { useEffect } from 'react'

import { VERIFICATION_DEBOUNCE_MS } from '../config/affiliateProgram.const'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../lib/affiliateProgramUtils'

import type {
  TraderReferralCodeContextValue,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../lib/affiliateProgramTypes'

interface AutoVerificationParams {
  traderReferralCode: TraderReferralCodeContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  runVerification: (code: string) => Promise<void>
}

export function useTraderReferralCodeAutoVerification(params: AutoVerificationParams): void {
  const { traderReferralCode, account, chainId, supportedNetwork, runVerification } = params
  const { shouldAutoVerify, savedCode, inputCode, incomingCode, verification } = traderReferralCode

  useEffect(() => {
    const { code, shouldDisable } = resolveAutoVerification({
      shouldAutoVerify,
      walletStatus: traderReferralCode.wallet.status,
      verificationKind: verification.kind,
      account,
      supportedNetwork,
      chainId,
      incomingCode,
      savedCode,
      inputCode,
    })

    if (shouldDisable) {
      traderReferralCode.actions.setShouldAutoVerify(false)
      return
    }

    if (!code) {
      return
    }

    const timer = setTimeout(() => {
      runVerification(code)
    }, VERIFICATION_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [
    account,
    chainId,
    inputCode,
    incomingCode,
    traderReferralCode.actions,
    traderReferralCode.wallet.status,
    runVerification,
    savedCode,
    shouldAutoVerify,
    supportedNetwork,
    verification.kind,
  ])
}

interface ResolveAutoVerificationParams {
  shouldAutoVerify: boolean
  walletStatus: TraderWalletReferralCodeState['status']
  verificationKind: TraderReferralCodeVerificationStatus['kind']
  account?: string
  supportedNetwork: boolean
  chainId?: number
  incomingCode?: string
  savedCode?: string
  inputCode: string
}

function resolveAutoVerification(params: ResolveAutoVerificationParams): { code?: string; shouldDisable: boolean } {
  // Centralises the auto-verify decision tree so the effect remains declarative.
  // Return `shouldDisable` when the modal must stop auto-verification (linked wallet),
  // otherwise surface the next code candidate once all prerequisites are satisfied.
  const { shouldAutoVerify } = params

  if (!shouldAutoVerify) {
    return { shouldDisable: false }
  }

  if (shouldDisableAutoVerification(params)) {
    return { shouldDisable: true }
  }

  const candidate = pickAutoVerificationCandidate(params)

  if (!candidate) {
    return { shouldDisable: false }
  }

  return { code: candidate, shouldDisable: false }
}

function shouldDisableAutoVerification(params: ResolveAutoVerificationParams): boolean {
  return (
    params.walletStatus === 'linked' || params.walletStatus === 'ineligible' || params.verificationKind === 'linked'
  )
}

function pickAutoVerificationCandidate(params: ResolveAutoVerificationParams): string | undefined {
  const { account, supportedNetwork, chainId, verificationKind, incomingCode, savedCode, inputCode } = params
  // If any prerequisite is missing we keep the modal idle and wait; the caller
  // will retry once account/network state changes or the current check finishes.
  if (!account || !supportedNetwork || chainId === undefined || verificationKind === 'checking') {
    return undefined
  }

  const sanitized = sanitizeReferralCode(incomingCode ?? inputCode ?? savedCode)

  if (!sanitized || !isReferralCodeLengthValid(sanitized)) {
    return undefined
  }

  return sanitized
}
