import { useWalletMetaData } from '@cow/modules/wallet'
import { getIsAmbireWallet } from '@src/custom/connection/utils'

export default function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return Boolean(getIsAmbireWallet(walletName))
}
