import { Connector } from 'wagmi'

import { ConnectionType } from '../../api/types'

export function isSafeConnector(connector: Connector | undefined): boolean {
  return connector?.id === 'safe' || connector?.type === ConnectionType.GNOSIS_SAFE
}
