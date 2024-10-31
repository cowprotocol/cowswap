import { atom } from 'jotai'

import { STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from 'modules/trade'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { VolumeFee } from '../types'

const COWSWAP_VOLUME_FEES: Record<SupportedChainId, VolumeFee | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.ARBITRUM_ONE]: {
    bps: 10, // 0.1%
    recipient: '0x451100Ffc88884bde4ce87adC8bB6c7Df7fACccd', // Arb1 Protocol fee safe
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    bps: 10, // 0.1%
    recipient: '0x6b3214fD11dc91De14718DeE98Ef59bCbFcfB432', // Gnosis Chain Protocol fee safe
  },
}

export const cowSwapFeeAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  const tradeState = get(derivedTradeStateAtom)
  const featureFlags = get(featureFlagsAtom)

  const { inputCurrency, outputCurrency } = tradeState || {}

  // Don't use it in the widget
  if (isInjectedWidget()) return null

  // Don't user it when the currencies are not set
  if (!inputCurrency || !outputCurrency) return null

  // TODO: remove this feature flag in another PR
  // Don't use it when isCowSwapFeeEnabled is not enabled
  if (!featureFlags.isCowSwapFeeEnabled) return null

  // Don't use it when on arb1 and shouldn't apply fee based on percentage
  if (chainId === SupportedChainId.ARBITRUM_ONE && !shouldApplyFee(account, featureFlags.arb1CowSwapFeePercentage))
    return null

  const isInputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(inputCurrency).toLowerCase())
  const isOutputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(outputCurrency).toLowerCase())

  // No stable-stable trades
  if (isInputTokenStable && isOutputTokenStable) return null

  return COWSWAP_VOLUME_FEES[chainId]
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
