import { atom } from 'jotai/index'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { walletDetailsAtom, walletInfoAtom } from '@cowprotocol/wallet'

import { derivedTradeStateAtom, isWrapOrUnwrapAtom } from 'modules/trade'

export const isEoaEthFlowAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom) || {}
  const { isSmartContractWallet } = get(walletDetailsAtom) || {}
  const isWrapOrUnwrap = get(isWrapOrUnwrapAtom)
  const { inputCurrency } = get(derivedTradeStateAtom) || {}

  const isNativeIn = !!inputCurrency?.symbol && getIsNativeToken(chainId, inputCurrency.symbol)

  return !isSmartContractWallet && isNativeIn && !isWrapOrUnwrap
})
