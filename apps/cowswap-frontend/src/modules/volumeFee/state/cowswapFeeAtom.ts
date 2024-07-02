import { atom } from 'jotai'

import { GNOSIS_CHAIN_STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from 'modules/trade'

import { VolumeFee } from '../types'

const COWSWAP_VOLUME_FEES: Record<SupportedChainId, VolumeFee | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.ARBITRUM_ONE]: null,
  // Only Gnosis chain
  [SupportedChainId.GNOSIS_CHAIN]: {
    bps: 10, // 0.1%
    recipient: '0x6b3214fD11dc91De14718DeE98Ef59bCbFcfB432', // Gnosis Chain Protocol fee safe
  },
}

export const cowSwapFeeAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const tradeState = get(derivedTradeStateAtom)

  const { inputCurrency, outputCurrency } = tradeState || {}

  // No widget mode
  if (isInjectedWidget()) return null

  if (!inputCurrency || !outputCurrency) return null

  const isInputTokenStable = GNOSIS_CHAIN_STABLECOINS.includes(getCurrencyAddress(inputCurrency).toLowerCase())
  const isOutputTokenStable = GNOSIS_CHAIN_STABLECOINS.includes(getCurrencyAddress(outputCurrency).toLowerCase())

  // No stable-stable trades
  if (isInputTokenStable && isOutputTokenStable) return null

  return COWSWAP_VOLUME_FEES[chainId]
})
