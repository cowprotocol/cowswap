import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookSDK } from 'cowSdk'
import useSWR, { SWRResponse } from 'swr'

export function useTwapAppData(
  appData: string,
  chainId: SupportedChainId,
): SWRResponse<Awaited<ReturnType<typeof orderBookSDK.getAppData>>> {
  return useSWR(
    ['twap-app-data', appData, chainId] as const,
    ([, hash, chainId]) => orderBookSDK.getAppData(hash, { chainId }),
    { ...SWR_NO_REFRESH_OPTIONS, errorRetryCount: 0 },
  )
}
