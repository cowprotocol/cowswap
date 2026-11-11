import { useEffect, useState } from 'react'

/** Matches the burst length used by the order progress bar. */
const CONFETTI_MS = 3000

/**
 * One burst from the moment the caller mounts, cleared afterwards so the
 * confetti canvas is not left mounted over the page for the whole session.
 */
export function useConfettiBurst(ms: number = CONFETTI_MS): boolean {
  const [bursting, setBursting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setBursting(false), ms)

    return () => clearTimeout(timer)
  }, [ms])

  return bursting
}
