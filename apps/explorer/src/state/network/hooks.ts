import { ExplorerAppState } from 'apps/explorer/state'
import useGlobalState from 'hooks/useGlobalState'
import { Network } from 'types'

export function useNetworkId(): Network | null {
  const [{ networkId }] = useGlobalState<ExplorerAppState>()

  return networkId
}

export function useNetworkOrDefault(): Network {
  const [{ networkId }] = useGlobalState<ExplorerAppState>()

  return networkId || Network.MAINNET
}
