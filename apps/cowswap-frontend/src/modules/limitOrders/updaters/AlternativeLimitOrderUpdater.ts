import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useENS } from '@cowprotocol/ens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'

import { LimitOrdersSettingsState, updateLimitOrdersSettingsAtom } from 'modules/limitOrders'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { limitOrdersDeadlines } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'

import { useAlternativeOrder, useHideAlternativeOrderModal } from 'common/state/alternativeOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function AlternativeLimitOrderUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)
  const alternativeOrder = useAlternativeOrder()
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()
  const updateRawState = useUpdateLimitOrdersRawState()
  const updatePartialFillOverride = useSetAtom(partiallyFillableOverrideAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  const { receiver, owner } = alternativeOrder || {}
  // Use custom recipient address if set and != owner
  const recipientAddress = receiver && receiver !== owner ? receiver : undefined
  // Load used ens name, if any
  const { name: recipient } = useENS(recipientAddress)

  useEffect(() => {
    if (alternativeOrder) {
      const {
        inputToken,
        outputToken,
        sellAmount,
        feeAmount,
        buyAmount: outputCurrencyAmount,
        kind: orderKind,
        partiallyFillable,
      } = alternativeOrder

      // To account for orders created before fee=0 went live
      const inputCurrencyAmount = (BigInt(sellAmount) + BigInt(feeAmount)).toString()

      console.log(`bug:AlternativeLimitOrderUpdater useEffect - updating with order`, alternativeOrder.id.slice(0, 8))
      updateRawState({
        inputCurrencyId: inputToken.address,
        outputCurrencyId: outputToken.address,
        inputCurrencyAmount,
        outputCurrencyAmount,
        orderKind,
        // Use loaded ens name, otherwise use address, if any of them exist
        recipient: recipient || recipientAddress,
        recipientAddress,
      })
      // Sync partially fillable override based on the order flag
      updatePartialFillOverride(partiallyFillable)

      // Sync settings (custom recipient and deadline values)
      updateSettingsState(getSettingsState(alternativeOrder, !!recipientAddress))
    }
    // Do it once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient, recipientAddress])

  useEffect(() => {
    if ((prevChainId && chainId !== prevChainId) || (prevAccount && prevAccount !== account)) {
      hideAlternativeOrderModal()
    }
  }, [chainId, account, prevChainId, prevAccount, hideAlternativeOrderModal])

  return null
}

/**
 * Get order creation and expiration times, as Date objs
 */
function getOrderTimes(order: Order | ParsedOrder): [Date, Date] {
  if ('validTo' in order) {
    // Order instance, creationTime is a ISO string, validTo is a UNIX timestamp
    return [new Date(order.creationTime), new Date(+order.validTo * 1000)]
  }
  // ParsedOrder instance, both are Date objects
  return [order.creationTime, order.expirationTime]
}

/**
 * Get order duration in milliseconds
 * @param order
 */
function getDuration(order: Order | ParsedOrder): number {
  const [creationTime, expirationTime] = getOrderTimes(order)
  const duration = expirationTime.getTime() - creationTime.getTime()
  return Math.round(duration)
}

/**
 * Get pre-defined deadline matching given duration, if any
 */
function getMatchingDeadline(duration: number) {
  // Match duration with approximate time
  return limitOrdersDeadlines.find(({ value }) => Math.round(value / duration) === 1)
}

/**
 * Get setting state based on existing order
 *
 * Will set:
 *  - `showCustomRecipient`
 *  - `partialFillsEnabled`
 *  - either `deadlineMilliseconds` or `customDeadlineTimestamp`
 */
function getSettingsState(order: Order | ParsedOrder, hasCustomRecipient: boolean): Partial<LimitOrdersSettingsState> {
  const state: Partial<LimitOrdersSettingsState> = {
    showRecipient: hasCustomRecipient,
    partialFillsEnabled: order.partiallyFillable,
  }

  const duration = getDuration(order)
  const deadline = getMatchingDeadline(duration)

  if (deadline) {
    return { ...state, deadlineMilliseconds: deadline.value }
  }

  const customDeadlineTimestamp = Math.round((Date.now() + duration) / 1000)

  return { ...state, customDeadlineTimestamp }
}
