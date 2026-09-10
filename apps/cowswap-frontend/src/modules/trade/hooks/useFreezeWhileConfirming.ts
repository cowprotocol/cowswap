import { useEffect, useRef } from 'react'

import { useTradeConfirmState } from './useTradeConfirmState'

/**
 * Returns `value` as-is while the user hasn't clicked confirm yet, tracking every update live.
 * Once the confirm flow starts (`isConfirming`), it stops tracking and keeps returning the last
 * value seen right before the click, regardless of how many times `value` itself changes
 * afterwards (e.g. a quote refresh landing while the wallet prompt is open).
 *
 * Use this for any quote-derived value shown in a trade confirm modal (receive amount info, rate
 * info, quote id, bridge quote amounts, ...) so the review screen can never display a different
 * amount than what the user actually confirmed/signed.
 */
export function useFreezeWhileConfirming<T>(value: T): T {
  const { isConfirming } = useTradeConfirmState()
  const frozenRef = useRef(value)

  // Only commit the snapshot once the render has actually committed, never during render itself -
  // otherwise a render React later discards (e.g. under concurrent rendering) could still leak an
  // uncommitted value into the frozen snapshot.
  useEffect(() => {
    if (!isConfirming) {
      frozenRef.current = value
    }
  }, [isConfirming, value])

  if (!isConfirming) {
    return value
  }

  // eslint-disable-next-line react-hooks/refs
  return frozenRef.current
}
