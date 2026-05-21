import { EvmChains, isEvmChain } from '@cowprotocol/cow-sdk'

import useGlobalState from 'hooks/useGlobalState'
import { Network } from 'types'

import { ExplorerAppState } from '../../explorer/state'

export function useNetworkId(): Network | null {
  const [state] = useGlobalState<ExplorerAppState | null>()
  const networkId = state?.networkId ?? null

  return networkId ? +networkId : networkId
}

/**
 * Same as {@link useNetworkId} but narrowed to EVM chains. Returns `null` when the current
 * route is non-EVM (e.g. `/solana/…`) — consumers like Euler / ERC-4626 hooks can use this
 * to no-op cleanly instead of crashing on `VIEM_CHAINS[chainId]` (which is keyed by EVM).
 */
export function useEvmNetworkId(): EvmChains | null {
  const networkId = useNetworkId()
  return networkId !== null && isEvmChain(networkId) ? networkId : null
}
