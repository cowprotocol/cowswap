import { useWalletInfo } from '@cowprotocol/wallet'

import { getCowShedHooks } from '../utils/getCowShedHooks'
import { isEvmProxyOwner } from '../utils/isEvmProxyOwner'

export function useCurrentBridgingAccountProxy(): string | undefined {
  const { account, chainId } = useWalletInfo()

  if (!isEvmProxyOwner(account, chainId)) return undefined

  return getCowShedHooks({ chainId }).proxyOf(account)
}
