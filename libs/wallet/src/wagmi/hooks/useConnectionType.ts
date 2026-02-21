import { useConnection } from 'wagmi'

import { ConnectionType } from '../../api/types'

export function useConnectionType(): ConnectionType {
  const { connector } = useConnection()

  return connector?.type as ConnectionType
}
