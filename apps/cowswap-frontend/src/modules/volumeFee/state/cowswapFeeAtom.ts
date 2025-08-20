import { atom } from 'jotai'

import { DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK, LpToken, STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom, TradeType, tradeTypeAtom } from 'modules/trade'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { VolumeFee } from '../types'

const COWSWAP_VOLUME_FEES: Record<SupportedChainId, VolumeFee | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.ARBITRUM_ONE]: {
    volumeBps: 10, // 0.1%
    recipient: DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[SupportedChainId.ARBITRUM_ONE],
  },
  [SupportedChainId.BASE]: null,
  [SupportedChainId.GNOSIS_CHAIN]: {
    volumeBps: 10, // 0.1%
    recipient: DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK[SupportedChainId.GNOSIS_CHAIN],
  },
  [SupportedChainId.POLYGON]: null,
  [SupportedChainId.AVALANCHE]: null,
  [SupportedChainId.LENS]: null,
  [SupportedChainId.BNB]: null,
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export const cowSwapFeeAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  const volumeFee = COWSWAP_VOLUME_FEES[chainId]

  // Early exit if fee is not set for this network
  if (!volumeFee) {
    return null
  }

  const tradeState = get(derivedTradeStateAtom)
  const tradeTypeState = get(tradeTypeAtom)
  const isYieldWidget = tradeTypeState?.tradeType === TradeType.YIELD
  const featureFlags = get(featureFlagsAtom)

  const { inputCurrency, outputCurrency } = tradeState || {}

  // Don't use it in the widget
  if (isInjectedWidget()) return null

  // Don't user it when the currencies are not set
  if (!inputCurrency || !outputCurrency) return null

  // No fee for Yield widget and LP tokens
  if (isYieldWidget || inputCurrency instanceof LpToken || outputCurrency instanceof LpToken) return null

  // Don't use it when on arb1 and shouldn't apply fee based on percentage
  if (chainId === SupportedChainId.ARBITRUM_ONE && !shouldApplyFee(account, featureFlags.arb1CowSwapFeePercentage))
    return null

  const isInputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(inputCurrency).toLowerCase())
  const isOutputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(outputCurrency).toLowerCase())

  // No stable-stable trades
  if (isInputTokenStable && isOutputTokenStable) return null

  return volumeFee
})

function shouldApplyFee(account: string | undefined, percentage: number | boolean | undefined): boolean {
  // Early exit for 100%, meaning should be enabled for everyone
  if (percentage === 100) {
    return true
  }

  // Falsy conditions
  if (typeof percentage !== 'number' || !account || percentage < 0 || percentage > 100) {
    return false
  }

  return BigInt(account) % 100n < percentage
}
