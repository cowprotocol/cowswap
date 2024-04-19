import { useWalletInfo as useWeb3WalletInfo } from '@web3modal/ethers5/react'
import { useMemo } from 'react'
import { accountsLoaders } from '../accountsLoaders'

export function useAccountsLoader() {
  const { walletInfo } = useWeb3WalletInfo()

  const walletUuid = walletInfo?.['uuid'] as string | undefined

  return useMemo(() => (walletUuid ? accountsLoaders[walletUuid] : undefined), [walletUuid])
}
