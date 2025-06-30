import { useEffect, useMemo, useRef } from 'react'

import { areSetsEqual, getAddress, isTruthy } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { PartialOrdersMap } from 'legacy/state/orders/reducer'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useDerivedTradeState } from './useDerivedTradeState'

const EMPTY_TOKEN_SET = new Set<string>();

export function usePriorityTokenAddresses(): Set<string> {
  const { chainId } = useWalletInfo()
  const state = useDerivedTradeState()

  const setOfTokensRef = useRef(new Set<string>())
  const pendingRef = useRef(0)

  const pending = useSelector<AppState, PartialOrdersMap | undefined>((state) => {
    return state.orders?.[chainId]?.pending
  })

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputCurrencyAddress = getAddress(inputCurrency)
  const outputCurrencyAddress = getAddress(outputCurrency)

  const newSetOfTokens = useMemo(() => {
    if (!pending) return EMPTY_TOKEN_SET;

    const setOfTokens = new Set(Object.values(pending)
      .filter(isTruthy)
      .filter(({ order }) => getUiOrderType(order) === UiOrderType.SWAP)
      .map(({ order }) => {
        return [order.inputToken.address, order.outputToken.address]
      })
      .flat());

    if (inputCurrencyAddress) {
      setOfTokens.add(inputCurrencyAddress)
    }

    if (outputCurrencyAddress) {
      setOfTokens.add(outputCurrencyAddress)
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

  return setOfTokensRef.current
}
