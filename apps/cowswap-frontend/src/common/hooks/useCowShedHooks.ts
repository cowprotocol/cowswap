import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCowShedHooks() {
  const { chainId } = useWalletInfo()

  return useSWR([chainId, 'CowShedHooks'], ([chainId]) => {
    return new CowShedHooks(chainId)
  }).data
}
