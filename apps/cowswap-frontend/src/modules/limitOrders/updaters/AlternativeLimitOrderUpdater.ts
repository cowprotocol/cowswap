import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { FractionUtils } from '@cowprotocol/common-utils'
import { useENS } from '@cowprotocol/ens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Price } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import {
  limitOrdersDerivedStateAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { LIMIT_ORDERS_DEADLINES } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { DEFAULT_TRADE_DERIVED_STATE } from '../../trade'
import { useLimitOrdersDerivedState } from '../hooks/useLimitOrdersDerivedState'
import { useUpdateActiveRate } from '../hooks/useUpdateActiveRate'
import { updateLimitRateAtom } from '../state/limitRateAtom'

export function AlternativeLimitOrderUpdater(): null {
  // Update raw state and related settings once on load
  useUpdateAlternativeRawState()

  // Set rate only once on load. If the user decides to change the values manually, the rate should then be allowed to be calculated
  useSetAlternativeRate()

  // Hide modal if chainId or account changes
  useResetAlternativeOnChainOrAccountChange()

  return null
}

function useUpdateAlternativeRawState(): null {
  const { order: alternativeOrder } = useAlternativeOrder() || {}
  const updateRawState = useUpdateLimitOrdersRawState()
  const updatePartialFillOverride = useSetAtom(partiallyFillableOverrideAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const updateDerivedState = useSetAtom(limitOrdersDerivedStateAtom)

  const { receiver, owner } = alternativeOrder || {}
  // Use custom recipient address if set and != owner
  const recipientAddress = receiver && receiver !== owner ? receiver : undefined
  // Load used ens name, if any
  const { name: recipient } = useENS(recipientAddress)

  useEffect(() => {
    if (alternativeOrder) {
      // Reset existing derived state to avoid stale info
      updateDerivedState({ ...DEFAULT_TRADE_DERIVED_STATE, isUnlocked: true })

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

  return null
}

function useSetAlternativeRate(): null {
  const updateRate = useUpdateActiveRate()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()

  const [hasSetRate, setHasSetRate] = useState(false)

  useEffect(() => {
    // Reset state when both currencies are null to prevent stale rates
    if (!inputCurrencyAmount && !outputCurrencyAmount) {
      setHasSetRate(false)
    }
  }, [inputCurrencyAmount, outputCurrencyAmount])

  useEffect(() => {
    // Update rate when rate has not been set yet
    if (!hasSetRate && inputCurrencyAmount && outputCurrencyAmount) {
      setHasSetRate(true)

      // Clear existing market rate
      updateLimitRateState({ marketRate: null })

      // Set new active rate
      // The rate expects a raw fraction which is NOT a Price instace
      const activeRate = FractionUtils.fromPrice(
        new Price({ baseAmount: inputCurrencyAmount, quoteAmount: outputCurrencyAmount }),
      )

      updateRate({ activeRate, isTypedValue: false, isRateFromUrl: false, isAlternativeOrderRate: true })
    }
  }, [inputCurrencyAmount, hasSetRate, outputCurrencyAmount, updateRate, updateLimitRateState])

  return null
}

function useResetAlternativeOnChainOrAccountChange(): null {
  const { chainId, account } = useWalletInfo()
  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()

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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMatchingDeadline(duration: number) {
  // Match duration with approximate time
  return LIMIT_ORDERS_DEADLINES.find(({ value }) => {
    const ratio = value / duration
    // If the ratio is +/-10% off of 1, consider it a match
    return ratio > 0.9 && ratio < 1.1
  })
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
