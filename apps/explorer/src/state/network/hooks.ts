import useGlobalState from 'hooks/useGlobalState'
import { Network } from 'types'

import { ExplorerAppState } from '../../explorer/state'

export function useNetworkId(): Network | null {
  const [{ networkId }] = useGlobalState<ExplorerAppState>()

  return networkId ? +networkId : networkId
}
