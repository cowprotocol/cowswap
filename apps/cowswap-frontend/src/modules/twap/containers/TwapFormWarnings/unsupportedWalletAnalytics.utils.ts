import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { CowSwapAnalyticsCategory, CowSwapGtmEvent } from 'common/analytics/types'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'

export interface UnsupportedWalletAnalyticsData {
  chainId: SupportedChainId
  walletName?: string
  isSafeViaWc: boolean
  isSmartContractWallet: boolean | undefined
  verificationState?: ExtensibleFallbackVerification
  sellTokenSymbol?: string
  buyTokenSymbol?: string
  sellAmount?: string
  buyAmount?: string
  sellAmountUsd?: string
  buyAmountUsd?: string
}

export function createUnsupportedWalletAnalyticsEvent(
  action: string,
  analyticsData: UnsupportedWalletAnalyticsData,
): CowSwapGtmEvent {
  const warningVariant = analyticsData.isSafeViaWc ? 'safe_via_wallet_connect' : 'unsupported_wallet'

  return {
    category: CowSwapAnalyticsCategory.TWAP,
    action,
    label: warningVariant,
    chainId: analyticsData.chainId,
    blocked_reason: 'tx_bundling_not_supported',
    warning_variant: warningVariant,
    wallet_name: analyticsData.walletName,
    is_safe_via_wc: analyticsData.isSafeViaWc,
    is_smart_contract_wallet: analyticsData.isSmartContractWallet,
    verification_state: analyticsData.verificationState,
    sell_token_symbol: analyticsData.sellTokenSymbol,
    buy_token_symbol: analyticsData.buyTokenSymbol,
    sell_amount: analyticsData.sellAmount,
    buy_amount: analyticsData.buyAmount,
    sell_amount_usd: analyticsData.sellAmountUsd,
    buy_amount_usd: analyticsData.buyAmountUsd,
  }
}

export function getUnsupportedWalletAnalyticsSignature(analyticsData: UnsupportedWalletAnalyticsData): string {
  return JSON.stringify([
    analyticsData.chainId,
    analyticsData.walletName,
    analyticsData.isSafeViaWc,
    analyticsData.isSmartContractWallet,
    analyticsData.verificationState,
    analyticsData.sellTokenSymbol,
    analyticsData.buyTokenSymbol,
  ])
}
