import { TREZOR_CONNECTOR_ID, trezorProvider } from './connectors/trezor/trezorConnector'

export interface WalletAccountsLoader {
  getAccounts(): string[] | null
  loadMoreAccounts(): Promise<void>
}

export const accountsLoaders: Record<string, WalletAccountsLoader> = {
  [TREZOR_CONNECTOR_ID]: {
    getAccounts() {
      return trezorProvider?.getAccounts() || null
    },
    loadMoreAccounts() {
      if (!trezorProvider) throw new Error('Trezor provider is not initialized')

      return trezorProvider.loadMoreAccounts()
    },
  },
}
