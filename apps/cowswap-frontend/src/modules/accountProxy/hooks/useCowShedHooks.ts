import { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getCowShedHooks } from '../utils/getCowShedHooks'

import type { AccountProxyConfig } from '../accountProxy.types'

export function useCowShedHooks(accountProxyConfig?: AccountProxyConfig): CowShedHooks | undefined {
  const { chainId } = useWalletInfo()

  return getCowShedHooks({ chainId, accountProxyConfig })
}
