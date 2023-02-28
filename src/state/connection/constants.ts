import { ConnectionType } from '@cow/modules/wallet/api/utils/connections'

export const BACKFILLABLE_WALLETS = [
  ConnectionType.INJECTED,
  ConnectionType.COINBASE_WALLET,
  ConnectionType.WALLET_CONNECT,
]
