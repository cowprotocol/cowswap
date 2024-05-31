import { useMemo } from 'react'

import { getAddress, isTruthy } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { PartialOrdersMap } from 'legacy/state/orders/reducer'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useDerivedTradeState } from './useDerivedTradeState'

export function usePriorityTokenAddresses(): string[] {
  const { chainId } = useWalletInfo()
  const state = useDerivedTradeState()

  const pending = useSelector<AppState, PartialOrdersMap | undefined>((state) => {
    return state.orders?.[chainId]?.pending
  })

  const pendingOrdersTokenAddresses = useMemo(() => {
    if (!pending) return undefined

    return Object.values(pending)
      .filter(isTruthy)
      .filter(({ order }) => getUiOrderType(order) === UiOrderType.SWAP)
      .map(({ order }) => {
        return [order.inputToken.address, order.outputToken.address]
      })
      .flat()
  }, [pending])

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputCurrencyAddress = getAddress(inputCurrency)
  const outputCurrencyAddress = getAddress(outputCurrency)

  return useMemo(() => {
    return (pendingOrdersTokenAddresses || []).concat(inputCurrencyAddress || [], outputCurrencyAddress || [])
  }, [inputCurrencyAddress, outputCurrencyAddress, pendingOrdersTokenAddresses])
}
