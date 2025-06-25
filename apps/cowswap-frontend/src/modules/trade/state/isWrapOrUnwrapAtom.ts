import { atom } from 'jotai'

import { getCurrencyAddress, getIsWrapOrUnwrap } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

export const isWrapOrUnwrapAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const { inputCurrency, outputCurrency } = get(derivedTradeStateAtom) || {}

  if (!inputCurrency || !outputCurrency) return false

  if (inputCurrency.chainId !== outputCurrency.chainId) return false

  const onputCurrencyId = getCurrencyAddress(inputCurrency)
  const outputCurrencyId = getCurrencyAddress(outputCurrency)

  return getIsWrapOrUnwrap(chainId, onputCurrencyId, outputCurrencyId)
})
