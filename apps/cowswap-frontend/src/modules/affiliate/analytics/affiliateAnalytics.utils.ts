import { GtmEvent, type CowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import {
  AffiliateAnalyticsAction,
  AffiliateCodeSource,
  AffiliateEntrySource,
  AffiliateModalState,
  AffiliatePageState,
  AffiliatePartnerCodeCreateFailureReason,
} from './affiliateAnalytics.types'

import { TraderWalletStatus } from '../hooks/useAffiliateTraderWallet'
import { AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'

interface TrackAffiliateEventParams {
  analytics: CowAnalytics
  action: AffiliateAnalyticsAction
  chainId?: SupportedChainId | number
  [key: string]: unknown
}

interface AffiliatePartnerPageStateParams {
  hasAccount: boolean
  hasExistingCode: boolean
  isLoading: boolean
  isSupportedPayoutNetwork: boolean
  isSupportedTradingNetwork: boolean
}

export function trackAffiliateEvent({ analytics, action, chainId, ...customParams }: TrackAffiliateEventParams): void {
  analytics.sendEvent(
    compactRecord({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action,
      chainId,
      ...customParams,
    }) as GtmEvent<CowSwapAnalyticsCategory.AFFILIATE>,
  )
}

export function getAffiliatePartnerPageState({
  hasAccount,
  hasExistingCode,
  isLoading,
  isSupportedPayoutNetwork,
  isSupportedTradingNetwork,
}: AffiliatePartnerPageStateParams): AffiliatePageState | undefined {
  if (!hasAccount || !isSupportedTradingNetwork || !isSupportedPayoutNetwork) {
    return AffiliatePageState.ONBOARD
  }

  if (isLoading) {
    return undefined
  }

  return hasExistingCode ? AffiliatePageState.CODE_LIVE : AffiliatePageState.CODE_CREATION
}

export function getAffiliateTraderPageState(
  walletStatus: TraderWalletStatus,
  hasSavedCode: boolean,
): AffiliatePageState {
  if (hasSavedCode && walletStatus !== TraderWalletStatus.DISCONNECTED) {
    return AffiliatePageState.LINKED
  }

  switch (walletStatus) {
    case TraderWalletStatus.PENDING:
      return AffiliatePageState.LOADING
    case TraderWalletStatus.UNSUPPORTED:
      return AffiliatePageState.UNSUPPORTED
    case TraderWalletStatus.INELIGIBLE:
      return AffiliatePageState.INELIGIBLE
    case TraderWalletStatus.ELIGIBILITY_UNKNOWN:
      return AffiliatePageState.ELIGIBILITY_UNKNOWN
    default:
      return AffiliatePageState.ONBOARD
  }
}

export function getAffiliateTraderModalState(walletStatus: TraderWalletStatus): AffiliateModalState {
  switch (walletStatus) {
    case TraderWalletStatus.UNSUPPORTED:
      return AffiliateModalState.UNSUPPORTED
    case TraderWalletStatus.LINKED:
      return AffiliateModalState.LINKED
    case TraderWalletStatus.INELIGIBLE:
      return AffiliateModalState.INELIGIBLE
    default:
      return AffiliateModalState.CODE_LINKING
  }
}

export function getAffiliateModalViewKey(
  isOpen: boolean,
  modalState: AffiliateModalState,
  walletStatus: TraderWalletStatus,
  entrySource: AffiliateEntrySource | undefined,
): string | undefined {
  if (!isOpen) {
    return undefined
  }

  return [modalState, walletStatus, entrySource].filter(Boolean).join(':')
}

export function getAffiliateModalOpenViewKey(
  isOpen: boolean,
  walletStatus: TraderWalletStatus,
  entrySource: AffiliateEntrySource | undefined,
  hasSavedCode: boolean,
  isLinked: boolean,
): string | undefined {
  if (!isOpen) {
    return undefined
  }

  return [walletStatus, entrySource, String(hasSavedCode), String(isLinked)].filter(Boolean).join(':')
}

export function normalizeAffiliatePartnerCodeCreateFailureReason(
  error: AffiliatePartnerCodeCreateError | undefined,
): AffiliatePartnerCodeCreateFailureReason {
  switch (error) {
    case AffiliatePartnerCodeCreateError.SignatureRejected:
      return AffiliatePartnerCodeCreateFailureReason.USER_REJECTED_SIGNATURE
    case AffiliatePartnerCodeCreateError.Unavailable:
      return AffiliatePartnerCodeCreateFailureReason.CODE_UNAVAILABLE
    case AffiliatePartnerCodeCreateError.NetworkError:
      return AffiliatePartnerCodeCreateFailureReason.NETWORK_ERROR
    default:
      return AffiliatePartnerCodeCreateFailureReason.UNEXPECTED_ERROR
  }
}

export function getAffiliateCodeSourceFallback(isLinked: boolean | undefined): AffiliateCodeSource {
  return isLinked ? AffiliateCodeSource.LEGACY_UNKNOWN : AffiliateCodeSource.MANUAL_INPUT
}

function compactRecord(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined))
}
