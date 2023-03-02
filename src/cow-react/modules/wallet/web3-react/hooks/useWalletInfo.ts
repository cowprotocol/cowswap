import { useWeb3React } from '@web3-react/core'
import { WalletInfo } from '@cow/modules/wallet'

export function useWalletInfo(): WalletInfo {
  const { account, chainId, isActive: active } = useWeb3React()

  return {
    chainId,
    active,
    account,
  }
}
