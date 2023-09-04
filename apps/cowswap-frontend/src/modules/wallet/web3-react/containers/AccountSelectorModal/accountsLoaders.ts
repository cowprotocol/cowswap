import { ConnectionType } from '../../../api/types'
import { trezorConnection } from '../../connection/trezor'
import { HardWareWallet } from '../../utils/getIsHardWareWallet'

interface WalletAccountsLoader {
  getAccounts(): string[] | null
  loadMoreAccounts(): Promise<void>
}

export const accountsLoaders: Record<HardWareWallet, WalletAccountsLoader> = {
  [ConnectionType.TREZOR]: {
    getAccounts() {
      return trezorConnection.connector.getAccounts()
    },
    loadMoreAccounts() {
      return trezorConnection.connector.loadMoreAccounts()
    },
  },
}
