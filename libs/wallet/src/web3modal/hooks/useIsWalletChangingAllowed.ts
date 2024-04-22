import { useWalletInfo } from '@web3modal/ethers5/react'
import { SAFE_CONNECTOR_UID } from '@cowprotocol/wallet-provider'

export function useIsWalletChangingAllowed(): boolean {
  const { walletInfo } = useWalletInfo()

  return walletInfo?.uuid !== SAFE_CONNECTOR_UID
}
