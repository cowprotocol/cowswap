import { useEffect } from 'react'

import { Command } from '@cowprotocol/types'

import { useLatestRef } from './useLatestRef'

/**
 * Invokes `handler` when the Escape key is pressed anywhere in the document.
 *
 * @param handler - Callback to run on Escape; pass `undefined` to disable
 */
export function useOnEscape(handler: Command | undefined): void {
  const handlerRef = useLatestRef(handler)

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handlerRef.current?.()
      }
    }

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [handlerRef])
}
