import { CowShedHooks, CoWShedVersion } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

export function useCowShedHooks(version?: CoWShedVersion): CowShedHooks | undefined {
  const { chainId } = useWalletInfo()

  return useSWR([chainId, version, 'CowShedHooks'], ([chainId, version]) => {
    return new CowShedHooks(chainId, undefined, version)
  }).data
}
