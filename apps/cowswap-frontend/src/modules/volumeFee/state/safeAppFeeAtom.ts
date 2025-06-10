import { atom } from 'jotai'

import { STABLECOINS } from '@cowprotocol/common-const'
import { getCurrencyAddress, isInjectedWidget } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { walletDetailsAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from 'modules/trade'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { VolumeFee } from '../types'

const SAFE_FEE_RECIPIENT = '0x8025BAcF968aa82BDfE51B513123b55BFb0060D3'

const FEE_TIERS = {
  TIER_1: 100_000, // 0 - 100k
  TIER_2: 1_000_000, // 100k - 1m
}

const FEE_PERCENTAGE_BPS = {
  REGULAR: {
    TIER_1: 10,
    TIER_2: 10,
    TIER_3: 10,
  },
  STABLE: {
    TIER_1: 10,
    TIER_2: 7,
    TIER_3: 5,
  },
}

/**
 * https://help.safe.global/en/articles/178530-how-does-the-widget-fee-work-for-native-swaps
 * https://github.com/safe-global/safe-wallet-web/blob/0818e713fa0f9bb7a6472e34a05888896ffc3835/src/features/swap/helpers/fee.ts
 */
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export const safeAppFeeAtom = atom<VolumeFee | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const { isSafeApp } = get(walletDetailsAtom)
  const { isSafeAppFeeEnabled } = get(featureFlagsAtom)
  const { inputCurrency, outputCurrency, inputCurrencyFiatAmount, outputCurrencyFiatAmount, orderKind } =
    get(derivedTradeStateAtom) || {}

  if (!isSafeApp || !isSafeAppFeeEnabled || isInjectedWidget()) return null

  const fiatCurrencyValue = orderKind === OrderKind.SELL ? inputCurrencyFiatAmount : outputCurrencyFiatAmount
  const fiatAmount = fiatCurrencyValue ? +fiatCurrencyValue.toExact() : null

  if (typeof fiatAmount !== 'number') return null

  const stablecoins = STABLECOINS[chainId]
  const isInputStableCoin = !!inputCurrency && stablecoins.has(getCurrencyAddress(inputCurrency).toLowerCase())
  const isOutputStableCoin = !!outputCurrency && stablecoins.has(getCurrencyAddress(outputCurrency).toLowerCase())
  const isStableCoinTrade = isInputStableCoin && isOutputStableCoin

  const volumeBps = (() => {
    if (fiatAmount < FEE_TIERS.TIER_1) {
      return isStableCoinTrade ? FEE_PERCENTAGE_BPS.STABLE.TIER_1 : FEE_PERCENTAGE_BPS.REGULAR.TIER_1
    }

    if (fiatAmount < FEE_TIERS.TIER_2) {
      return isStableCoinTrade ? FEE_PERCENTAGE_BPS.STABLE.TIER_2 : FEE_PERCENTAGE_BPS.REGULAR.TIER_2
    }

    return isStableCoinTrade ? FEE_PERCENTAGE_BPS.STABLE.TIER_3 : FEE_PERCENTAGE_BPS.REGULAR.TIER_3
  })()

  return { volumeBps, recipient: SAFE_FEE_RECIPIENT }
})
