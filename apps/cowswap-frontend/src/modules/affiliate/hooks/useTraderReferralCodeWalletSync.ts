import { useEffect, useMemo } from 'react'

import { TraderEligibilityStatus, useAffiliateTraderEligibility } from './useAffiliateTraderEligibility'

import { TraderReferralCodeContextValue, TraderWalletReferralCodeState } from '../lib/affiliateProgramTypes'

interface WalletSyncParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  actions: TraderReferralCodeContextValue['actions']
  savedCode?: string
}

enum WalletStateStatus {
  UNKNOWN = 'unknown',
  DISCONNECTED = 'disconnected',
  UNSUPPORTED = 'unsupported',
  ELIGIBLE = 'eligible',
  LINKED = 'linked',
  INELIGIBLE = 'ineligible',
  ELIGIBILITY_UNKNOWN = 'eligibility-unknown',
}

export function useTraderReferralCodeWalletSync(params: WalletSyncParams): void {
  const { account, chainId, supportedNetwork, actions, savedCode } = params
  const shouldRunEligibilityCheck = Boolean(account && supportedNetwork)
  const { status: eligibilityStatus, hasLoadingTimeout } = useAffiliateTraderEligibility({
    account,
    enabled: shouldRunEligibilityCheck,
  })
  const { setWalletState } = actions

  const walletState = useMemo(
    () =>
      resolveWalletState({
        account,
        chainId,
        supportedNetwork,
        eligibilityStatus,
        shouldRunEligibilityCheck,
        hasLoadingTimeout,
        savedCode,
      }),
    [account, chainId, eligibilityStatus, hasLoadingTimeout, savedCode, shouldRunEligibilityCheck, supportedNetwork],
  )

  useEffect(() => {
    setWalletState(walletState)
  }, [setWalletState, walletState])
}

interface ResolveWalletStateParams {
  account?: string
  chainId?: number
  supportedNetwork: boolean
  eligibilityStatus: TraderEligibilityStatus
  shouldRunEligibilityCheck: boolean
  hasLoadingTimeout: boolean
  savedCode?: string
}

function resolveWalletState(params: ResolveWalletStateParams): TraderWalletReferralCodeState {
  const { account, chainId, supportedNetwork, shouldRunEligibilityCheck } = params

  if (!account) {
    return DISCONNECTED_WALLET_STATE
  }

  if (!supportedNetwork) {
    return { status: WalletStateStatus.UNSUPPORTED, chainId }
  }

  if (!shouldRunEligibilityCheck) {
    return UNKNOWN_WALLET_STATE
  }

  return resolveEligibilityWalletState(params)
}

function resolveEligibilityWalletState(params: ResolveWalletStateParams): TraderWalletReferralCodeState {
  const { eligibilityStatus, hasLoadingTimeout, savedCode } = params

  if (hasLoadingTimeout) {
    return ELIGIBILITY_UNKNOWN_WALLET_STATE
  }

  switch (eligibilityStatus) {
    case TraderEligibilityStatus.ERROR:
      return ELIGIBILITY_UNKNOWN_WALLET_STATE
    case TraderEligibilityStatus.LOADING:
    case TraderEligibilityStatus.IDLE:
      return UNKNOWN_WALLET_STATE
    case TraderEligibilityStatus.HAS_PAST_TRADES:
      return savedCode ? { status: WalletStateStatus.LINKED, code: savedCode } : INELIGIBLE_EXISTING_TRADE_WALLET_STATE
    case TraderEligibilityStatus.NO_PAST_TRADES:
      return ELIGIBLE_WALLET_STATE
  }
}

const DISCONNECTED_WALLET_STATE: TraderWalletReferralCodeState = { status: WalletStateStatus.DISCONNECTED }
const UNKNOWN_WALLET_STATE: TraderWalletReferralCodeState = { status: WalletStateStatus.UNKNOWN }
const ELIGIBLE_WALLET_STATE: TraderWalletReferralCodeState = { status: WalletStateStatus.ELIGIBLE }
const ELIGIBILITY_UNKNOWN_WALLET_STATE: TraderWalletReferralCodeState = {
  status: WalletStateStatus.ELIGIBILITY_UNKNOWN,
}
const INELIGIBLE_EXISTING_TRADE_WALLET_STATE: TraderWalletReferralCodeState = {
  status: WalletStateStatus.INELIGIBLE,
  reason: 'This wallet already executed a trade.',
}
