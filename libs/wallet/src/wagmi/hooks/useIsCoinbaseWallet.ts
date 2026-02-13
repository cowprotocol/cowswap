import { useConnection } from 'wagmi'

import { ConnectorType } from '../../api/types'

export function useIsCoinbaseWallet(): boolean {
  const { connector } = useConnection()

  return connector?.type === ConnectorType.COINBASE_WALLET
}
