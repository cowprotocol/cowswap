import { atom } from 'jotai'

/** Latest observed block number (EVM block / Solana slot) per chainId. */
export const blockNumberByChainIdAtom = atom<Record<number, number | undefined>>({})

interface BlockNumberUpdate {
  chainId: number
  blockNumber: number
}

/**
 * Write-only atom that records a block number for a chain, keeping the value monotonic —
 * stale/out-of-order updates (a lower block number) are ignored.
 */
export const updateBlockNumberAtom = atom(null, (get, set, { chainId, blockNumber }: BlockNumberUpdate) => {
  const current = get(blockNumberByChainIdAtom)[chainId]

  if (current !== undefined && current >= blockNumber) return

  set(blockNumberByChainIdAtom, (prev) => ({ ...prev, [chainId]: blockNumber }))
})
