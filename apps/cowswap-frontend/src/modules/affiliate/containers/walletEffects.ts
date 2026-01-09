import { useEffect, useRef } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'

import { getWalletReferralStatus } from '../services/referralApi'
import { ReferralContextValue } from '../types'
import { sanitizeReferralCode } from '../utils/code'

interface WalletSyncParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  actions: ReferralContextValue['actions']
}

export function useReferralWalletSync(params: WalletSyncParams): void {
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

interface WalletStatusParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  referral: ReferralContextValue
}

export function useReferralWalletStatus(params: WalletStatusParams): void {
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
