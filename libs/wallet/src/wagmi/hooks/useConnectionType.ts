import { ConnectionType } from 'src/api/types'
import { useConnection } from 'wagmi'

export function useConnectionType(): ConnectionType {
  const { connector } = useConnection()

  return connector?.type as ConnectionType
}
