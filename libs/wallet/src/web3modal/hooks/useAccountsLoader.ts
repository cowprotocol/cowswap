import { useWalletInfo as useWeb3WalletInfo } from '@web3modal/ethers5/react'
import { useMemo } from 'react'
import { TREZOR_CONNECTOR_ID, trezorProvider } from '../connectors/trezor/trezorConnector'

const accountsLoaders: Record<string, WalletAccountsLoader> = {
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

export interface WalletAccountsLoader {
  getAccounts(): string[] | null
  loadMoreAccounts(): Promise<void>
}

export function useAccountsLoader() {
  const { walletInfo } = useWeb3WalletInfo()

  const walletUuid = walletInfo?.['uuid'] as string | undefined

  return useMemo(() => (walletUuid ? accountsLoaders[walletUuid] : undefined), [walletUuid])
}
