import { COW_SHED_1_0_1_VERSION } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getCowShedHooks } from '../utils/getCowShedHooks'
import { isEvmProxyOwner } from '../utils/isEvmProxyOwner'

export function useCurrentBridgingAccountProxy(): string | undefined {
  const { account, chainId } = useWalletInfo()

  if (!isEvmProxyOwner(account, chainId)) return undefined

  return getCowShedHooks({
    chainId,
    accountProxyConfig: { id: `version-${COW_SHED_1_0_1_VERSION}`, version: COW_SHED_1_0_1_VERSION },
  }).proxyOf(account)
}
