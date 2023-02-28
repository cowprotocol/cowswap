import { useWalletMetaData } from '@cow/modules/wallet'
import { getIsAmbireWallet } from '@cow/modules/wallet/api/utils'

export default function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return Boolean(getIsAmbireWallet(walletName))
}
