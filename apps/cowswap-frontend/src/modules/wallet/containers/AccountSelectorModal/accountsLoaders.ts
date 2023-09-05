import { ConnectionType } from '../../../../../../../libs/wallet/src/api/types'
import { trezorConnection } from '../../../../../../../libs/wallet/src/web3-react/connection/trezor'
import { HardWareWallet } from '../../../../../../../libs/wallet/src/web3-react/utils/getIsHardWareWallet'

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
