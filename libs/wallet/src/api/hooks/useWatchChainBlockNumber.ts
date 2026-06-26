import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { useWatchBlockNumber } from 'wagmi'

import { useWatchSolanaSlot } from './useWatchSolanaSlot'

import { useWalletInfo } from '../hooks'

interface UseWatchChainBlockNumberParams {
  enabled?: boolean
  onBlockNumber: (blockNumber: bigint) => void
}

/**
 * Chain-agnostic block-number watcher. Detects the active network and delegates to the
 * EVM (wagmi) or Solana (slot) watcher; the other stays disabled. The Solana slot is
 * forwarded through the same `bigint` callback as EVM block numbers, so consumers do not
 * need to know which chain is active.
 */
export function useWatchChainBlockNumber({ enabled, onBlockNumber }: UseWatchChainBlockNumberParams): void {
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)
  const active = Boolean(chainId) && Boolean(enabled)

  useWatchBlockNumber({
    chainId,
    enabled: active && !isSolana,
    onBlockNumber,
  })

  useWatchSolanaSlot({
    enabled: active && isSolana,
    onSlot: onBlockNumber,
  })
}
