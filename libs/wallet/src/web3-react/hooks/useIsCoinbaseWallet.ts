import { useConnectionType } from './useConnectionType'

import { ConnectionType } from '../../api/types'

export function useIsCoinbaseWallet(): boolean {
  return useConnectionType() === ConnectionType.COINBASE_WALLET
}
