import { useCallback, useEffect, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { CowEventListener, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { AssistantFill } from '../types'

/**
 * Notices when an order actually settles.
 *
 * Without this the assistant can only say "let me know once it fills and I'll set
 * up the next one" — which hands a bookkeeping job back to the person whose whole
 * reason for using this was not doing bookkeeping. It's most obvious in a two-leg
 * plan: WETH→USDC→DAI is one intention, and having to come back and report leg one
 * makes it feel like two unrelated errands.
 *
 * Uses the app's own ON_FULFILLED_ORDER event rather than polling the orderbook.
 * The event is what the app itself trusts to refresh balances after a fill, so it
 * fires at the same moment the rest of the UI updates.
 */
export interface FillWatch {
  /** The most recent settlement, until it's been reported. */
  fill: AssistantFill | null
  clear(): void
}

type FulfilledListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents.ON_FULFILLED_ORDER>

export function useFillWatch(): FillWatch {
  const [fill, setFill] = useState<AssistantFill | null>(null)
  const tokensByAddress = useTokensByAddressMap()

  useEffect(() => {
    const listener: FulfilledListener = {
      event: CowWidgetEvents.ON_FULFILLED_ORDER,
      handler: ({ order, chainId }) => {
        // Executed amounts, not requested ones: what they actually received is the
        // only figure worth reporting, and on a partial fill it's the only true one.
        const sell = describe(order.executedSellAmount ?? order.sellAmount, order.sellToken, tokensByAddress)
        const buy = describe(order.executedBuyAmount ?? order.buyAmount, order.buyToken, tokensByAddress)

        console.info('[assistant] order filled', sell, '→', buy)
        setFill({
          chainId,
          sellAmount: sell.amount,
          sellSymbol: sell.symbol,
          buyAmount: buy.amount,
          buySymbol: buy.symbol,
        })
      },
    }

    WIDGET_EVENT_EMITTER.on(listener)
    // Block body: off() returns a value, and an arrow returning it isn't a valid
    // effect cleanup.
    return () => {
      WIDGET_EVENT_EMITTER.off(listener)
    }
  }, [tokensByAddress])

  const clear = useCallback(() => setFill(null), [])

  return { fill, clear }
}

/**
 * Amount and symbol for one side, or nulls.
 *
 * An unresolvable token yields a null amount rather than a raw atom count — the
 * same rule the order-history summariser follows. A number shown with the wrong
 * decimals is off by orders of magnitude, and no number beats a wrong number.
 */
function describe(
  raw: string | undefined,
  address: string,
  tokensByAddress: Record<string, TokenWithLogo | undefined>,
): { amount: string | null; symbol: string | null } {
  const token = tokensByAddress[getAddressKey(address)]
  if (!token || !raw) return { amount: null, symbol: token?.symbol ?? null }

  try {
    return { amount: CurrencyAmount.fromRawAmount(token, raw).toSignificant(6), symbol: token.symbol ?? null }
  } catch {
    return { amount: null, symbol: token.symbol ?? null }
  }
}
