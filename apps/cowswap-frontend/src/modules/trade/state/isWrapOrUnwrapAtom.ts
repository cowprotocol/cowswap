import { atom } from 'jotai'

import { getIsWrapOrUnwrap } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

export const isWrapOrUnwrapAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const { inputCurrency, outputCurrency } = get(derivedTradeStateAtom) || {}

  if (!inputCurrency || !outputCurrency) return false

  if (inputCurrency.chainId !== outputCurrency.chainId) return false

  return getIsWrapOrUnwrap(chainId, inputCurrency, outputCurrency)
})
