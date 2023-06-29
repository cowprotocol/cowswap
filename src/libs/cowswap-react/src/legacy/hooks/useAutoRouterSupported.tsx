import { useWalletInfo } from 'modules/wallet'

import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useWalletInfo()
  return isSupportedChainId(chainId)
}
