import { useEffect } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { getCowSoundSuccess } from 'modules/sounds'

/**
 * The CoW moo, once, from the moment the caller mounts.
 *
 * The element comes from a shared cache, so a second claim in the same session
 * would otherwise resume a finished clip rather than replay it.
 */
export function useClaimMoo(): void {
  useEffect(() => {
    const moo = getCowSoundSuccess()

    moo.currentTime = 0

    moo.play().catch((err: unknown) => {
      // Autoplay policies refuse sound without a prior gesture on the page: the
      // claim still landed, so this is never worth surfacing to the claimer.
      console.error('🐮 Moooooo sound cannot be played', normalizeError(err))
    })

    return () => moo.pause()
  }, [])
}
