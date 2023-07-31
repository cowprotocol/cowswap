import { useWalletMetaData } from 'modules/wallet'
import { getIsAmbireWallet } from 'modules/wallet/api/utils/connection'

export default function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return getIsAmbireWallet(walletName)
}
