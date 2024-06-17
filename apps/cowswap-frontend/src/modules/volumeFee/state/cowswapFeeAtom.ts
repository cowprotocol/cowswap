import { atom } from 'jotai'

import { GNOSIS_CHAIN_STABLECOINS, NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { getIsNativeToken, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from 'modules/trade'

import { VolumeFee } from '../types'

const COWSWAP_VOLUME_FEE: VolumeFee = {
  bps: 10, // 0.1%
  recipient: '0x6b3214fD11dc91De14718DeE98Ef59bCbFcfB432', // Gnosis Chain Protocol fee safe
}

export const cowSwapFeeAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const tradeState = get(derivedTradeStateAtom)

  const { inputCurrency, outputCurrency } = tradeState || {}

  // No widget mode
  if (isInjectedWidget()) return null

  // Only Gnosis chain
  if (chainId !== SupportedChainId.GNOSIS_CHAIN) return null

  if (!inputCurrency || !outputCurrency) return null

  const isInputTokenStable = GNOSIS_CHAIN_STABLECOINS.includes(
    getIsNativeToken(inputCurrency) ? NATIVE_CURRENCY_ADDRESS : inputCurrency.address.toLowerCase()
  )
  const isOutputTokenStable = GNOSIS_CHAIN_STABLECOINS.includes(
    getIsNativeToken(outputCurrency) ? NATIVE_CURRENCY_ADDRESS : outputCurrency.address.toLowerCase()
  )

  // No stable-stable trades
  if (isInputTokenStable && isOutputTokenStable) return null

  return COWSWAP_VOLUME_FEE
})
