import { useWalletMetaData, getIsAmbireWallet } from '@cowswap/wallet'

export function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return getIsAmbireWallet(walletName)
}
