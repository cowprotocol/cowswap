import { atom } from 'jotai'

import { LpToken, STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom, TradeType, tradeTypeAtom } from 'modules/trade'

import { VolumeFee } from '../types'

const COWSWAP_VOLUME_FEES: Record<SupportedChainId, VolumeFee | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.ARBITRUM_ONE]: {
    bps: 10, // 0.1%
    recipient: '0x451100Ffc88884bde4ce87adC8bB6c7Df7fACccd', // Arb1 Protocol fee safe
  },
  [SupportedChainId.BASE]: {
    bps: 10, // 0.1%
    recipient: '0x3c4DBcCf8d80D3d92B0d82197aebf52574ED1F3B', // Base Protocol fee safe
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    bps: 10, // 0.1%
    recipient: '0x6b3214fD11dc91De14718DeE98Ef59bCbFcfB432', // Gnosis Chain Protocol fee safe
  },
}

export const cowSwapFeeAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const volumeFee = COWSWAP_VOLUME_FEES[chainId]

  // Early exit if fee is not set for this network
  if (!volumeFee) {
    return null
  }

  const tradeState = get(derivedTradeStateAtom)
  const tradeTypeState = get(tradeTypeAtom)
  const isYieldWidget = tradeTypeState?.tradeType === TradeType.YIELD

  const { inputCurrency, outputCurrency } = tradeState || {}

  // Don't use it in the widget
  if (isInjectedWidget()) return null

  // Don't user it when the currencies are not set
  if (!inputCurrency || !outputCurrency) return null

  // No fee for Yield widget and LP tokens
  if (isYieldWidget || inputCurrency instanceof LpToken || outputCurrency instanceof LpToken) return null

  const isInputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(inputCurrency).toLowerCase())
  const isOutputTokenStable = STABLECOINS[chainId].has(getCurrencyAddress(outputCurrency).toLowerCase())

  // No stable-stable trades
  if (isInputTokenStable && isOutputTokenStable) return null

  return volumeFee
})
