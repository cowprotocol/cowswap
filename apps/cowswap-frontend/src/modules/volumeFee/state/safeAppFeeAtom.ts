import { atom } from 'jotai'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletDetailsAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { featureFlagsAtom } from '../../../common/state/featureFlagsState'
import { derivedTradeStateAtom } from '../../trade'
import { VolumeFee } from '../types'

const SAFE_FEE_RECIPIENT = '0x63695Eee2c3141BDE314C5a6f89B98E62808d716'
const SAFE_FEE_BPS = 10

/**
 * https://help.safe.global/en/articles/178530-how-does-the-widget-fee-work-for-native-swaps
 * https://github.com/safe-global/safe-wallet-web/blob/0818e713fa0f9bb7a6472e34a05888896ffc3835/src/features/swap/helpers/fee.ts
 */
export const safeAppFeeAtom = atom<VolumeFee | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const { isSafeApp } = get(walletDetailsAtom)
  const { isSafeAppFeeEnabled } = get(featureFlagsAtom)
  const { inputCurrencyFiatAmount, outputCurrencyFiatAmount, orderKind } = get(derivedTradeStateAtom) || {}
  const isBaseNetwork = chainId === SupportedChainId.BASE

  if (!isSafeApp || !isSafeAppFeeEnabled || isBaseNetwork) return null

  const fiatCurrencyValue = orderKind === OrderKind.SELL ? inputCurrencyFiatAmount : outputCurrencyFiatAmount
  const fiatAmount = fiatCurrencyValue ? +fiatCurrencyValue.toExact() : null

  if (typeof fiatAmount !== 'number') return null

  return { bps: SAFE_FEE_BPS, recipient: SAFE_FEE_RECIPIENT }
})
