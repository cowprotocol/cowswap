import { MutableRefObject, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isProdLike } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useReferral } from '../hooks/useReferral'
import { getWalletReferralStatus, isSupportedReferralNetwork, verifyReferralCode } from '../services/referralApi'
import {
  ReferralContextValue,
  ReferralVerificationApiResponse,
  ReferralVerificationStatus,
  WalletReferralState,
} from '../types'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../utils/code'

export function ReferralController(): ReactNode {
  const referral = useReferral()
  const { account, chainId } = useWalletInfo()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()

  const supportedNetwork = useMemo(
    () => (chainId !== undefined ? isSupportedReferralNetwork(chainId) : false),
    [chainId],
  )

  useReferralWalletSync({ account, chainId, supportedNetwork, actions: referral.actions })
  useReferralWalletStatus({
    account,
    chainId,
    supportedNetwork,
    referral,
  })

  const runVerification = useReferralVerification({
    account,
    chainId,
    supportedNetwork,
    referral,
    analytics,
    toggleWalletModal,
  })

  useReferralAutoVerification({
    account,
    chainId,
    supportedNetwork,
    referral,
    runVerification,
  })

  usePendingVerificationHandler({ referral, runVerification })

  return null
}

function useReferralWalletSync(params: {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  actions: ReferralContextValue['actions']
}): void {
  const { account, chainId, supportedNetwork, actions } = params

  useEffect(() => {
    if (!account) {
      actions.setWalletState({ status: 'disconnected' })
      return
    }

    if (!supportedNetwork) {
      actions.setWalletState({ status: 'unsupported', chainId })
      return
    }

    actions.setWalletState({ status: 'eligible' })
  }, [account, actions, chainId, supportedNetwork])
}

function useReferralWalletStatus(params: {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  referral: ReferralContextValue
}): void {
  const { account, chainId, supportedNetwork, referral } = params
  const lastFetchedAccountRef = useRef<string | undefined>(undefined)
  const lastFetchedChainRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!account || !supportedNetwork) {
      lastFetchedAccountRef.current = undefined
      lastFetchedChainRef.current = undefined
      return
    }

    if (lastFetchedAccountRef.current === account && lastFetchedChainRef.current === chainId) {
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const response = await getWalletReferralStatus({ account })

        if (cancelled) {
          return
        }

        handleWalletStatusResponse({
          actions: referral.actions,
          response,
          incomingCode: referral.incomingCode,
          savedCode: referral.savedCode,
          inputCode: referral.inputCode,
        })
        lastFetchedAccountRef.current = account
        lastFetchedChainRef.current = chainId
      } catch (error) {
        if (!isProdLike) {
          console.warn('[Referral] Failed to load wallet referral status', error)
        }

        referral.actions.setWalletState({ status: 'eligible' })
        lastFetchedAccountRef.current = undefined
        lastFetchedChainRef.current = undefined
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    account,
    chainId,
    referral.actions,
    referral.incomingCode,
    referral.inputCode,
    referral.savedCode,
    supportedNetwork,
  ])
}

function handleWalletStatusResponse(params: {
  actions: ReferralContextValue['actions']
  response: Awaited<ReturnType<typeof getWalletReferralStatus>>
  incomingCode?: string
  savedCode?: string
  inputCode: string
}): void {
  const { actions, response, incomingCode, savedCode, inputCode } = params
  const linked = sanitizeReferralCode(response.wallet.linkedCode || '')

  if (linked) {
    actions.setSavedCode(linked)
    actions.setWalletState({ status: 'linked', code: linked })
    actions.completeVerification({ kind: 'linked', code: linked, linkedCode: linked })
    return
  }

  const ineligibleReason = response.wallet.ineligibleReason

  if (ineligibleReason) {
    actions.setWalletState({ status: 'ineligible', reason: ineligibleReason })

    const sanitizedIncoming = incomingCode ? sanitizeReferralCode(incomingCode) : undefined
    const codeForMessage = sanitizeReferralCode(sanitizedIncoming || savedCode || inputCode)

    if (codeForMessage) {
      actions.completeVerification({
        kind: 'ineligible',
        code: codeForMessage,
        reason: ineligibleReason,
        incomingCode: sanitizedIncoming,
      })
    }

    return
  }

  actions.setWalletState({ status: 'eligible' })
}

function useReferralVerification(params: {
  referral: ReferralContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  analytics: ReturnType<typeof useCowAnalytics>
  toggleWalletModal: () => void
}): (code: string) => Promise<void> {
  const { referral, account, chainId, supportedNetwork, analytics, toggleWalletModal } = params
  const pendingVerificationRef = useRef<number | null>(null)

  const applyVerificationResult = useCallback(
    (status: ReferralVerificationStatus, walletState?: WalletReferralState) => {
      referral.actions.completeVerification(status)

      if (walletState) {
        referral.actions.setWalletState(walletState)
      }
    },
    [referral.actions],
  )

  const trackVerifyResult = useCallback(
    (result: string, eligible: boolean, extraLabel?: string) => {
      const parts = [`result=${result}`, `eligible=${eligible ? 'yes' : 'no'}`]

      if (extraLabel) {
        parts.push(extraLabel)
      }

      analytics.sendEvent({ category: 'referral', action: 'verify_result', label: parts.join(';') })
    },
    [analytics],
  )

  return useCallback(
    (rawCode: string) =>
      performVerification({
        rawCode,
        account,
        chainId,
        supportedNetwork,
        toggleWalletModal,
        actions: referral.actions,
        analytics,
        pendingVerificationRef,
        applyVerificationResult,
        trackVerifyResult,
        incomingCode: referral.incomingCode,
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      referral.actions,
      referral.incomingCode,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
    ],
  )
}

function handleVerificationResponse(params: {
  response: ReferralVerificationApiResponse
  sanitizedCode: string
  incomingCode?: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
}): void {
  const { response, sanitizedCode, incomingCode, actions, applyVerificationResult, trackVerifyResult } = params
  const linked = sanitizeReferralCode(response.wallet.linkedCode || '')

  if (linked) {
    actions.setSavedCode(linked)
    applyVerificationResult({ kind: 'linked', code: sanitizedCode, linkedCode: linked }, { status: 'linked', code: linked })
    trackVerifyResult('linked', false)
    return
  }

  if (!response.wallet.eligible) {
    const reason = response.wallet.ineligibleReason || 'This wallet is not eligible for referral rewards.'
    const sanitizedIncoming = incomingCode ? sanitizeReferralCode(incomingCode) : undefined

    applyVerificationResult(
      {
        kind: 'ineligible',
        code: sanitizedCode,
        reason,
        incomingCode: sanitizedIncoming,
      },
      { status: 'ineligible', reason },
    )
    trackVerifyResult('ineligible', false, reason)
    return
  }

  const programActive = response.code.programActive !== false

  if (response.code.status === 'invalid') {
    actions.setSavedCode(sanitizedCode)
    applyVerificationResult({ kind: 'invalid', code: sanitizedCode })
    trackVerifyResult('invalid', false)
    return
  }

  if (response.code.status === 'expired' || !programActive) {
    actions.setSavedCode(sanitizedCode)
    applyVerificationResult({ kind: 'expired', code: sanitizedCode })
    trackVerifyResult('expired', false)
    return
  }

  actions.setSavedCode(sanitizedCode)
  applyVerificationResult({ kind: 'valid', code: sanitizedCode, eligible: true, programActive })
  trackVerifyResult('valid', true)
}


interface PerformVerificationParams {
  rawCode: string
  account?: string
  chainId?: number
  supportedNetwork: boolean
  toggleWalletModal: () => void
  actions: ReferralContextValue['actions']
  analytics: ReturnType<typeof useCowAnalytics>
  pendingVerificationRef: MutableRefObject<number | null>
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  incomingCode?: string
}

async function performVerification({
  rawCode,
  account,
  chainId,
  supportedNetwork,
  toggleWalletModal,
  actions,
  analytics,
  pendingVerificationRef,
  applyVerificationResult,
  trackVerifyResult,
  incomingCode,
}: PerformVerificationParams): Promise<void> {
  const sanitizedCode = sanitizeReferralCode(rawCode)

  if (!sanitizedCode || !isReferralCodeLengthValid(sanitizedCode)) {
    return
  }

  if (!account) {
    toggleWalletModal()
    return
  }

  if (!supportedNetwork || chainId === undefined) {
    actions.setWalletState({ status: 'unsupported', chainId })
    return
  }

  const requestId = Date.now()
  pendingVerificationRef.current = requestId
  actions.startVerification(sanitizedCode)
  analytics.sendEvent({
    category: 'referral',
    action: 'verify_started',
    label: `hasWallet=${account ? 'yes' : 'no'};supported=${supportedNetwork ? 'yes' : 'no'}`,
    value: sanitizedCode.length,
  })

  try {
    const response = await verifyReferralCode({ code: sanitizedCode, account, chainId })

    if (pendingVerificationRef.current !== requestId) {
      return
    }

    handleVerificationResponse({
      response,
      sanitizedCode,
      incomingCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
    })
  } catch (error) {
    if (pendingVerificationRef.current !== requestId) {
      return
    }

    const status = (error as Error & { status?: number }).status
    const errorType = status === 429 ? 'rate-limit' : 'network'
    const message =
      errorType === 'rate-limit' ? 'Too many attempts. Try later.' : 'Unable to check code right now.'

    applyVerificationResult({ kind: 'error', code: sanitizedCode, errorType, message })
    trackVerifyResult('error', false, `type=${errorType}`)

    if (!isProdLike) {
      console.warn('[Referral] Verification failed', error)
    }
  }
}
function useReferralAutoVerification(params: {
  referral: ReferralContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  runVerification: (code: string) => Promise<void>
}): void {
  const { referral, account, chainId, supportedNetwork, runVerification } = params
  const { shouldAutoVerify, savedCode, inputCode, verification } = referral

  useEffect(() => {
    if (!shouldAutoVerify) {
      return
    }

    if (!account || !supportedNetwork || chainId === undefined) {
      return
    }

    const codeCandidate = savedCode || inputCode
    const sanitized = sanitizeReferralCode(codeCandidate)

    if (!isReferralCodeLengthValid(sanitized)) {
      return
    }

    if (verification.kind === 'checking') {
      return
    }

    runVerification(sanitized)
  }, [account, chainId, inputCode, runVerification, savedCode, shouldAutoVerify, supportedNetwork, verification.kind])
}

function usePendingVerificationHandler(params: {
  referral: ReferralContextValue
  runVerification: (code: string) => Promise<void>
}): void {
  const { referral, runVerification } = params
  const { pendingVerificationRequest, actions, inputCode, savedCode } = referral

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
