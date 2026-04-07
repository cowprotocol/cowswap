import useGlobalState from 'hooks/useGlobalState'
import { Network } from 'types'

import { ExplorerAppState } from '../../explorer/state'

export function useNetworkId(): Network | null {
  const [state] = useGlobalState<ExplorerAppState | null>()
  const networkId = state?.networkId ?? null

  return networkId ? +networkId : networkId
}
