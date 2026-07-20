import { GtmEvent, type CowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import {
  AffiliateAnalyticsAction,
  AffiliateModalState,
  AffiliatePageState,
  AffiliatePartnerCodeCreateFailureReason,
} from './affiliateAnalytics.types'

import { TraderWalletStatus } from '../hooks/useAffiliateTraderWallet'
import { AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'
import { logAffiliate } from '../utils/logger'

interface AffiliatePartnerPageStateParams {
  hasAccount: boolean
  hasExistingCode: boolean
  isLoading: boolean
  isSupportedPayoutNetwork: boolean
  isSupportedTradingNetwork: boolean
}

interface TrackAffiliateEventParams {
  analytics: CowAnalytics
  action: AffiliateAnalyticsAction
  chainId?: SupportedChainId | number
  [key: string]: unknown
}

export function getAffiliateModalViewKey(
  isOpen: boolean,
  modalState: AffiliateModalState,
  walletStatus: TraderWalletStatus,
): string | undefined {
  if (!isOpen) {
    return undefined
  }

  return [modalState, walletStatus].join(':')
}

export function getAffiliatePartnerPageState({
  hasAccount,
  hasExistingCode,
  isLoading,
  isSupportedPayoutNetwork,
  isSupportedTradingNetwork,
}: AffiliatePartnerPageStateParams): AffiliatePageState | undefined {
  if (!hasAccount || !isSupportedTradingNetwork) {
    return AffiliatePageState.ONBOARD
  }

  if (isLoading) {
    return undefined
  }

  if (!isSupportedPayoutNetwork && !hasExistingCode) {
    return AffiliatePageState.ONBOARD
  }

  return hasExistingCode ? AffiliatePageState.CODE_LIVE : AffiliatePageState.CODE_CREATION
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

export function getAffiliateTraderPageState(
  walletStatus: TraderWalletStatus,
  hasSavedCode: boolean,
): AffiliatePageState {
  switch (walletStatus) {
    case TraderWalletStatus.PENDING:
      return AffiliatePageState.LOADING
    case TraderWalletStatus.UNSUPPORTED:
      return AffiliatePageState.UNSUPPORTED
    case TraderWalletStatus.INELIGIBLE:
      return AffiliatePageState.INELIGIBLE
    case TraderWalletStatus.DISCONNECTED:
      return AffiliatePageState.ONBOARD
    default:
      return hasSavedCode ? AffiliatePageState.LINKED : AffiliatePageState.ONBOARD
  }
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

export function trackAffiliateEvent({ analytics, action, chainId, ...customParams }: TrackAffiliateEventParams): void {
  try {
    analytics.sendEvent(
      compactRecord({
        category: CowSwapAnalyticsCategory.AFFILIATE,
        action,
        chainId,
        ...customParams,
      }) as GtmEvent<CowSwapAnalyticsCategory.AFFILIATE>,
    )
  } catch (error) {
    logAffiliate('Failed to send analytics event', { action, error })
  }
}

function compactRecord(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined))
}
