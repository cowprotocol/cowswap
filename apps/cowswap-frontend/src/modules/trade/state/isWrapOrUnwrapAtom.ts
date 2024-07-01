import { atom } from 'jotai'

import { getIsWrapOrUnwrap } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

export const isWrapOrUnwrapAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const { inputCurrency, outputCurrency } = get(derivedTradeStateAtom) || {}

  return getIsWrapOrUnwrap(chainId, inputCurrency?.symbol, outputCurrency?.symbol)
})
