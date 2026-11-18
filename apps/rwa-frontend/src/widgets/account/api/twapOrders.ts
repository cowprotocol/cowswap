import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { collectPages } from '../lib/collectPages'

import { programmaticOrderApi } from '@/shared/api'

const TWAP_ORDERS_PAGE_SIZE = 1000
const MAX_TWAP_ORDERS_PAGES = 10

/** TWAPs placed by `owner`, an EOA or a Safe, newest first. An EOA's TWAPs are owned by its CoW Shed */
export function collectTwapOrders<R>(
  chainId: SupportedChainId,
  owner: string,
  select: (twap: TwapOrder) => R | null,
): Promise<R[]> {
  return collectPages(
    (offset, limit) =>
      programmaticOrderApi
        .getTwapOrders({ resolvedOwner: owner, chainId }, { direction: 'desc', offset, limit })
        .then(({ items }) => items),
    select,
    { pageSize: TWAP_ORDERS_PAGE_SIZE, maxPages: MAX_TWAP_ORDERS_PAGES },
  )
}
