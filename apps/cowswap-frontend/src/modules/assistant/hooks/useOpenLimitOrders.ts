import { useMemo } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { PendingOrdersPrices, usePendingOrdersPrices } from 'modules/orders'
import { OrderFillability, usePendingOrdersFillability } from 'modules/ordersTable'

import { AssistantOpenOrder } from '../types'

/** Enough to answer "what's still open"; more is a job for the orders table. */
const MAX_OPEN_ORDERS = 10

/** Past this, `validTo` is a placeholder rather than an intention. */
const NEVER_EXPIRES_YEARS = 5

/**
 * The open limit orders, as the app already understands them.
 *
 * ⚠️ **Deliberately not the Orderbook API.** `get_orders` fetches the 30 most recent
 * orders and filters within that window, which is the wrong tool for this question:
 * open limit orders are long-lived — one seen in production expires in 2033 — so an
 * active trader can have thirty more-recent orders sitting on top of them. The honest
 * reply then becomes "no open orders among their 30 most recent", which is true,
 * useless, and exactly wrong for someone with three live orders.
 *
 * `useOnlyPendingOrders` (via `usePendingOrdersFillability`) is the app's own complete
 * list for this account and chain, with no window at all.
 *
 * It also carries the two things a person actually wants and the API cannot tell them:
 * whether the price has moved away since placement (`isUnfillable`), and whether the
 * order *cannot* settle because the balance was spent elsewhere or the allowance was
 * revoked. Those are how a limit order silently never fills.
 */
export function useOpenLimitOrders(): { orders: AssistantOpenOrder[]; truncated: boolean } {
  const fillability = usePendingOrdersFillability(OrderClass.LIMIT)
  const prices = usePendingOrdersPrices()

  return useMemo(() => {
    const entries = Object.values(fillability).filter((entry): entry is OrderFillability => Boolean(entry))
    const orders = entries.slice(0, MAX_OPEN_ORDERS).map((entry) => toAssistantOrder(entry, prices))

    return { orders, truncated: entries.length > orders.length }
  }, [fillability, prices])
}

/** Amount and symbol, or null — never a raw atom count. */
function amount(raw: string | undefined, token: Token | undefined): string | null {
  if (!raw || !token) return null

  try {
    return `${CurrencyAmount.fromRawAmount(token, raw).toSignificant(6)} ${token.symbol ?? ''}`.trim()
  } catch {
    return null
  }
}

/**
 * ⚠️ **Only a definite `false` is a blocker.**
 *
 * The app's fillability checks are `boolean | undefined`, and `undefined` means the
 * check hasn't run. Treating that as "no" would tell someone their order is stuck
 * when nobody has looked yet — so the unknown case is reported as unknown, and
 * silence about blockers only means something once the checks have answered.
 */
function blockersOf(
  hasEnoughBalance: boolean | undefined,
  hasEnoughAllowance: boolean | undefined,
): Partial<AssistantOpenOrder> | null {
  if (hasEnoughBalance === undefined || hasEnoughAllowance === undefined) {
    return { fillabilityUnknown: true }
  }

  const blockers = [hasEnoughBalance ? null : 'balance', hasEnoughAllowance ? null : 'allowance'].filter(
    (reason): reason is string => reason !== null,
  )

  return blockers.length > 0 ? { cannotFillBecause: blockers } : null
}

/**
 * A date, or nothing when the order effectively never expires.
 *
 * ⚠️ `GenericOrder` is a union: the legacy `Order` carries `validTo` as a unix
 * second, `ParsedOrder` carries `expirationTime` as a Date. In practice
 * `useOnlyPendingOrders` returns the former, but reading only one shape would break
 * silently the day the other arrives.
 *
 * Limit orders are routinely written with a `validTo` decades out, and "expires 2106"
 * is noise that invites a remark about something irrelevant — the same reason the
 * order-history summariser suppresses expiry on filled orders.
 */
function expiryOf(order: OrderFillability['order']): string | undefined {
  const date = 'expirationTime' in order ? order.expirationTime : new Date(order.validTo * 1000)
  if (!date || Number.isNaN(date.getTime())) return undefined

  const years = (date.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
  return years > NEVER_EXPIRES_YEARS ? undefined : date.toISOString().slice(0, 10)
}

/** One entry, flattened into what the assistant can say about it. */
function toAssistantOrder(entry: OrderFillability, prices: PendingOrdersPrices): AssistantOpenOrder {
  const { order, hasEnoughBalance, hasEnoughAllowance } = entry
  const expires = expiryOf(order)
  const price = prices[order.id]?.estimatedExecutionPrice

  return {
    ref: `${order.id.slice(0, 10)}…`,
    selling: amount(order.sellAmount, order.inputToken),
    buying: amount(order.buyAmount, order.outputToken),
    ...(expires ? { expires } : {}),
    ...(order.isUnfillable ? { outOfMarket: true as const } : {}),
    ...(blockersOf(hasEnoughBalance, hasEnoughAllowance) ?? {}),
    ...(order.isCancelling ? { cancelling: true as const } : {}),
    // Absent when the quote API errored — `prices[id]` is explicitly null then, which
    // must not read as "nothing notable about the price".
    ...(price
      ? {
          estimatedFillPrice: `${price.toSignificant(6)} ${price.quoteCurrency.symbol} per ${price.baseCurrency.symbol}`,
        }
      : {}),
  }
}
