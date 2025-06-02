import { atom } from 'jotai'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { walletDetailsAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom, isWrapOrUnwrapAtom } from 'modules/trade'

export const isEoaEthFlowAtom = atom((get) => {
  const { isSmartContractWallet } = get(walletDetailsAtom) || {}
  const isWrapOrUnwrap = get(isWrapOrUnwrapAtom)
  const { inputCurrency } = get(derivedTradeStateAtom) || {}

  const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)

  return !isSmartContractWallet && isNativeIn && !isWrapOrUnwrap
})
