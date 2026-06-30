import { SAFE_CONNECTOR_ID } from 'src/reown/consts'
import { Connector } from 'wagmi'

import { ConnectionType } from '../../api/types'

export function isSafeConnector(connector: Connector | undefined): boolean {
  return connector?.id === SAFE_CONNECTOR_ID || connector?.type === ConnectionType.GNOSIS_SAFE
}
