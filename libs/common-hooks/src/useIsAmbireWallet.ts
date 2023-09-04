import { useWalletMetaData, getIsAmbireWallet } from 'modules/wallet'

export function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return getIsAmbireWallet(walletName)
}
