import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWalletInfo } from 'modules/wallet'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useWalletInfo()
  return isSupportedChainId(chainId)
}
