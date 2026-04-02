import { useEffect, useMemo, useRef } from 'react'

import { areSetsEqual, getAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useDerivedTradeState } from './useDerivedTradeState'

export function usePriorityTokenAddresses(): Set<string> {
  const { chainId, account } = useWalletInfo()
  const state = useDerivedTradeState()

  const setOfTokensRef = useRef(new Set<string>())
  const pendingRef = useRef(0)

  const pending = useOnlyPendingOrders(chainId, account)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputCurrencyAddress = getAddress(inputCurrency)
  const outputCurrencyAddress = getAddress(outputCurrency)

  const newSetOfTokens = useMemo(() => {
    const setOfTokens = new Set(
      pending.reduce((acc, order) => {
        if (order && getUiOrderType(order) === UiOrderType.SWAP) {
          acc.push(getAddressKey(order.inputToken.address))
          acc.push(getAddressKey(order.outputToken.address))
        }
        return acc
      }, [] as string[]),
    )

    if (inputCurrencyAddress) {
      setOfTokens.add(getAddressKey(inputCurrencyAddress))
    }

    if (outputCurrencyAddress) {
      setOfTokens.add(getAddressKey(outputCurrencyAddress))
    }

    return setOfTokens
  }, [pending, inputCurrencyAddress, outputCurrencyAddress])

  useEffect(() => {
    const prev = setOfTokensRef.current
    const next = newSetOfTokens

    // if some of the orders was filled, we need to update balances
    const pendingCount = Object.keys(pending || {}).length
    if (pendingCount != pendingRef.current) {
      pendingRef.current = pendingCount
      setOfTokensRef.current = next
      return
    }

    // we don't need to push updating of the balances if the set of tokens is the same (f.e. user reverse tokens on swap form)
    if (!areSetsEqual(prev, next)) {
      setOfTokensRef.current = next
    }
  }, [newSetOfTokens, pending])

  // eslint-disable-next-line react-hooks/refs
  return setOfTokensRef.current
}
