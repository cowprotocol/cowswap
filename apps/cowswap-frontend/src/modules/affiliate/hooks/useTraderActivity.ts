import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderStats } from './useAffiliateTraderStats'

import { fetchTraderActivity, OrderWithChainId } from '../api/fetchTraderActivity'
import { ACTIVITY_UI_LIMIT } from '../config/affiliateProgram.const'
import { isExecutedNonIntegratorOrder, toValidTimestamp } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

const EMPTY_ORDERS: OrderWithChainId[] = []

const TIMESTAMP_ROUNDING_BUFFER_MS = ms`10m`

export function useTraderActivity(): SWRResponse<OrderWithChainId[] | null, Error> {
  const { account } = useWalletInfo()
  const { data: stats } = useAffiliateTraderStats(account)

  return useSWR<OrderWithChainId[] | null, Error>(
    !!account && !!stats ? ['affiliate-trader-activity', account] : null,
    async () => {
      if (!account || !stats) return EMPTY_ORDERS

      const allOrders = await fetchTraderActivity(account)
      const linkedSince = toValidTimestamp(stats.linked_since)
      const rewardsEnd = toValidTimestamp(stats.rewards_end)

      const validOrders = allOrders
        .filter((order) => {
          if (!isExecutedNonIntegratorOrder(order)) return false

          const orderTimestamp = toValidTimestamp(order.creationDate)
          if (orderTimestamp < linkedSince - TIMESTAMP_ROUNDING_BUFFER_MS) return false
          if (orderTimestamp > rewardsEnd + TIMESTAMP_ROUNDING_BUFFER_MS) return false

          return true
        })
        .sort((a, b) => toValidTimestamp(b.creationDate) - toValidTimestamp(a.creationDate))
        .slice(0, ACTIVITY_UI_LIMIT)

      logAffiliate(
        safeShortenAddress(account),
        `Found ${validOrders.length} valid orders in this trader's past activity`,
      )

      return validOrders
    },
  )
}
