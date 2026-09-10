import { useCallback, useMemo, useRef, useState } from 'react'

interface FreezeOnConfirmResult<T> {
  /** `liveProps` until the confirm button is clicked, the click-time snapshot afterwards */
  props: T
  isConfirming: boolean
  handleConfirm(): Promise<void | boolean>
}

/**
 * Snapshots `liveProps` the instant the confirm button is clicked and keeps returning that snapshot
 * for the rest of the flow, so the review screen can never display a different amount than what the
 * user actually confirmed/signed.
 *
 * The snapshot is taken synchronously inside the click handler, never from an effect: an effect only
 * runs after the render that started the flow has committed, and by then a quote refresh may already
 * have replaced the values that were on screen when the user clicked.
 */
export function useFreezeOnConfirm<T>(
  liveProps: T,
  onConfirm: () => Promise<void | boolean>,
): FreezeOnConfirmResult<T> {
  const livePropsRef = useRef(liveProps)
  // eslint-disable-next-line react-hooks/refs
  livePropsRef.current = liveProps

  const [frozenProps, setFrozenProps] = useState<T | null>(null)

  const handleConfirm = useCallback(async (): Promise<void | boolean> => {
    setFrozenProps(livePropsRef.current)

    try {
      const isConfirmed = await onConfirm()

      // A falsy result means the attempt never reached the wallet (price impact declined, vetoed by
      // a widget hook, ...), so go back to live values for the user to review and retry.
      if (!isConfirmed) {
        setFrozenProps(null)
      }

      return isConfirmed
    } catch (error) {
      setFrozenProps(null)
      throw error
    }
  }, [onConfirm])

  return useMemo(
    () => ({
      props: frozenProps ?? liveProps,
      isConfirming: frozenProps !== null,
      handleConfirm,
    }),
    [frozenProps, liveProps, handleConfirm],
  )
}
