import { atom } from 'jotai'

import { getCurrencyAddress, getIsWrapOrUnwrap } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

export const isWrapOrUnwrapAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const { inputCurrency, outputCurrency } = get(derivedTradeStateAtom) || {}

  const onputCurrencyId = inputCurrency ? getCurrencyAddress(inputCurrency) : null
  const outputCurrencyId = outputCurrency ? getCurrencyAddress(outputCurrency) : null

  return getIsWrapOrUnwrap(chainId, onputCurrencyId, outputCurrencyId)
})
