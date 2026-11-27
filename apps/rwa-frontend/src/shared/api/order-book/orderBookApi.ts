import { OrderBookApi } from '@cowprotocol/cow-sdk'

import { getPageBackendEnv } from '@/shared/config'

/** Pass `{ chainId }` as the context override of each call */
export const orderBookApi = new OrderBookApi({ env: getPageBackendEnv() })
