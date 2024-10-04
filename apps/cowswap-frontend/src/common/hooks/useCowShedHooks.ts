import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

export function useCowShedHooks() {
  const { chainId } = useWalletInfo()

  return useSWR([chainId, 'CowShedHooks'], ([chainId]) => {
    return new CowShedHooks(chainId)
  }).data
}
