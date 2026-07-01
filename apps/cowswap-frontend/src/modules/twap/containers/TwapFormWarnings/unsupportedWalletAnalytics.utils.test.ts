import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  createUnsupportedWalletAnalyticsEvent,
  getUnsupportedWalletAnalyticsSignature,
  UnsupportedWalletAnalyticsData,
} from './unsupportedWalletAnalytics.utils'

import { ExtensibleFallbackVerification } from '../../services/verifyExtensibleFallback'

const analyticsData: UnsupportedWalletAnalyticsData = {
  chainId: SupportedChainId.MAINNET,
  walletName: 'MetaMask',
  isSafeViaWc: false,
  isSmartContractWallet: false,
  verificationState: ExtensibleFallbackVerification.HAS_NOTHING,
  sellTokenSymbol: 'COW',
  buyTokenSymbol: 'ETH',
  sellAmount: '10',
  buyAmount: '0.1',
  sellAmountUsd: '12.34',
  buyAmountUsd: '12.28',
}

describe('unsupportedWalletAnalytics.utils', () => {
  it('creates a TWAP blocked-wallet analytics event with trade context', () => {
    expect(createUnsupportedWalletAnalyticsEvent('twap_unsupported_wallet_viewed', analyticsData)).toEqual({
      category: 'TWAP',
      action: 'twap_unsupported_wallet_viewed',
      label: 'unsupported_wallet',
      chainId: SupportedChainId.MAINNET,
      blocked_reason: 'tx_bundling_not_supported',
      warning_variant: 'unsupported_wallet',
      wallet_name: 'MetaMask',
      is_safe_via_wc: false,
      is_smart_contract_wallet: false,
      verification_state: ExtensibleFallbackVerification.HAS_NOTHING,
      sell_token_symbol: 'COW',
      buy_token_symbol: 'ETH',
      sell_amount: '10',
      buy_amount: '0.1',
      sell_amount_usd: '12.34',
      buy_amount_usd: '12.28',
    })
  })

  it('does not change the signature when only amounts change', () => {
    const previousSignature = getUnsupportedWalletAnalyticsSignature(analyticsData)
    const nextSignature = getUnsupportedWalletAnalyticsSignature({
      ...analyticsData,
      sellAmount: '11',
      buyAmount: '0.11',
      sellAmountUsd: '13.57',
      buyAmountUsd: '13.49',
    })

    expect(nextSignature).toEqual(previousSignature)
  })

  it('changes the signature when the blocked wallet state changes', () => {
    const previousSignature = getUnsupportedWalletAnalyticsSignature(analyticsData)
    const nextSignature = getUnsupportedWalletAnalyticsSignature({
      ...analyticsData,
      isSafeViaWc: true,
    })

    expect(nextSignature).not.toEqual(previousSignature)
  })
})
