import { useCallback, useEffect, useRef } from 'react'

import { useThrottledCallback } from '@cowprotocol/common-hooks'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import ms from 'ms.macro'

// Solana slots advance several times per second; throttle updates to a sane cadence.
const SLOT_UPDATE_THROTTLE_MS = ms`5s`

interface UseWatchSolanaSlotParams {
  enabled?: boolean
  /** Same signature as wagmi's `onBlockNumber`, so callers can treat both chains symmetrically. */
  onSlot: (slot: bigint) => void
}

/**
 * Watches the Solana slot (the chain's analog of a block number).
 *
 * Reads the read-only `@solana/web3.js` Connection the reown Solana adapter creates from
 * the network RPC, so it works before any wallet connects. `onSlotChange` only fires on
 * *new* slots, so the current slot is seeded once via `getSlot` on subscribe. Updates are
 * throttled to at most once every {@link SLOT_UPDATE_THROTTLE_MS}, always with the latest slot.
 */
export function useWatchSolanaSlot({ enabled, onSlot }: UseWatchSolanaSlotParams): void {
  const { connection } = useAppKitConnection()

  // Gates emissions to the active subscription. `useThrottledCallback` can fire a trailing
  // update up to SLOT_UPDATE_THROTTLE_MS after the last slot — without exposing a way to
  // cancel it — so a slot seen while watching can otherwise land after cleanup (chain switch,
  // hidden window, disable) and feed a stale Solana slot to the now-different active chain.
  const activeRef = useRef(false)

  // `useThrottledCallback` keeps a stable identity and tracks the latest callback internally,
  // so a changing `onSlot` does not tear down and re-create the subscription.
  const emitSlot = useThrottledCallback(
    useCallback(
      (slot: bigint) => {
        if (activeRef.current) onSlot(slot)
      },
      [onSlot],
    ),
    SLOT_UPDATE_THROTTLE_MS,
  )

  useEffect(() => {
    if (!enabled || !connection) return

    activeRef.current = true

    // Seed the current slot — onSlotChange only emits on subsequent slots.
    connection
      .getSlot()
      .then((slot) => {
        if (activeRef.current) emitSlot(BigInt(slot))
      })
      .catch(() => void 0)

    const subscriptionId = connection.onSlotChange(({ slot }) => emitSlot(BigInt(slot)))

    return () => {
      activeRef.current = false
      connection.removeSlotChangeListener(subscriptionId)
    }
  }, [enabled, connection, emitSlot])
}
