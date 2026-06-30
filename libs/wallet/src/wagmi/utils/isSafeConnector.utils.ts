import { Connector } from 'wagmi'

import { ConnectionType } from '../../api/types'
import { SAFE_CONNECTOR_ID } from '../../reown/consts'

export function isSafeConnector(connector: Connector | undefined): boolean {
  return connector?.id === SAFE_CONNECTOR_ID || connector?.type === ConnectionType.GNOSIS_SAFE
}
