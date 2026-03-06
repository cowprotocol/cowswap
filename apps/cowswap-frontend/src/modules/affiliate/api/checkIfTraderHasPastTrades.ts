import { Address } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { safeShortenAddress } from '../../../utils/address'
import {
  AFFILIATE_SUPPORTED_CHAIN_IDS,
  PAST_ORDERS_SCAN_LIMIT,
  TRADE_ENVS_TO_CHECK,
} from '../config/affiliateProgram.const'
import { isExecutedNonIntegratorOrder } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

export async function checkIfTraderHasPastTrades(owner: Address): Promise<boolean> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain/env to check for executed trades')

  const tradesByChainAndEnv = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.flatMap((chainId) =>
      TRADE_ENVS_TO_CHECK.map(async (env) => {
        try {
          const orders = await getOrders({ owner, limit: PAST_ORDERS_SCAN_LIMIT }, { chainId, env })
          return orders.filter(isExecutedNonIntegratorOrder)
        } catch (error) {
          logAffiliate(safeShortenAddress(owner), 'Failed to fetch trades while checking past trades', error, {
            chainId,
            env,
          })

          return []
        }
      }),
    ),
  )

  const hasPastTrades = tradesByChainAndEnv.some((orders) => orders.length > 0)
  logAffiliate(
    safeShortenAddress(owner),
    `Called cow api, trader ${hasPastTrades ? 'has past trades' : 'does not have past trades'}`,
  )
  return hasPastTrades
}
