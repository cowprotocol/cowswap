import { useWalletMetaData } from '@cow/modules/wallet'
import { getIsAmbireWallet } from '@cow/modules/wallet/api/utils/connection'

export default function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return getIsAmbireWallet(walletName)
}
