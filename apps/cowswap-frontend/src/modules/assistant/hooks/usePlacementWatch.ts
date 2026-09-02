import { useCallback, useEffect, useState } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { CowEventListener, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { AssistantPlacement } from '../types'

/**
 * Notices when an order is signed and posted, so the conversation can end rather
 * than trail off.
 *
 * The assistant walks someone through choosing a token, a price and an approval, and
 * then goes quiet at the moment it worked. Saying so is a small thing that makes the
 * whole exchange feel finished.
 *
 * ⚠️ **Market orders are deliberately excluded.** A swap settles seconds after it's
 * posted, and `useFillWatch` already reports that with the amounts that actually
 * arrived — strictly better information than "placed". Firing both would put two
 * messages in the panel moments apart, the first of which is immediately superseded.
 *
 * A limit order is the case this exists for: placement may be the last thing that
 * happens for days, so it is the natural end of the interaction.
 */
export interface PlacementWatch {
  placement: AssistantPlacement | null
  clear(): void
}

type PostedListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents.ON_POSTED_ORDER>

export function usePlacementWatch(): PlacementWatch {
  const [placement, setPlacement] = useState<AssistantPlacement | null>(null)

  useEffect(() => {
    const listener: PostedListener = {
      event: CowWidgetEvents.ON_POSTED_ORDER,
      handler: ({ orderType, inputAmount, outputAmount, inputToken, outputToken }) => {
        if (orderType === UiOrderType.SWAP) return

        console.info('[assistant] order placed', orderType)
        setPlacement({
          orderType,
          selling: amount(inputAmount, inputToken),
          buying: amount(outputAmount, outputToken),
        })
      },
    }

    WIDGET_EVENT_EMITTER.on(listener)
    // Block body: off() returns a value, and an arrow returning it isn't a valid
    // effect cleanup.
    return () => {
      WIDGET_EVENT_EMITTER.off(listener)
    }
  }, [])

  const clear = useCallback(() => setPlacement(null), [])

  return { placement, clear }
}

/**
 * Amount and symbol, or null.
 *
 * The payload carries full `TokenInfo`, so nothing has to be looked up — but a
 * missing decimals field would silently shift the number by orders of magnitude, so
 * an unusable token yields null rather than a guess.
 */
function amount(raw: bigint | undefined, token: TokenInfo | undefined): string | null {
  if (raw === undefined || !token || typeof token.decimals !== 'number') return null

  try {
    const currency = new Token(token.chainId, token.address, token.decimals, token.symbol)
    return `${CurrencyAmount.fromRawAmount(currency, raw.toString()).toSignificant(6)} ${token.symbol ?? ''}`.trim()
  } catch {
    return null
  }
}
