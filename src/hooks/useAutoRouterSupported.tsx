import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWalletInfo } from '@cow/modules/wallet'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useWalletInfo()
  return isSupportedChainId(chainId)
}
