import { Address } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'
import { safeShortenAddress } from 'utils/address'

import {
  AFFILIATE_SUPPORTED_CHAIN_IDS,
  PAST_ORDERS_SCAN_LIMIT,
  TRADE_ENVS_TO_CHECK,
} from '../config/affiliateProgram.const'
import {
  extractFullAppDataFromOrder,
  getRefCodeFromAppData,
  isExecutedNonIntegratorOrder,
} from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

export interface PastTradesCheckResult {
  hasPastTrades: boolean
  refCode?: string
}

/**
 * Scans executed non-integrator orders across supported chain/env pairs and returns whether
 * the trader has past orders, which can be used to determine trader eligibility, plus the
 * first valid affiliate ref code found in their appData.
 */
export async function checkIfTraderHasPastTrades(owner: Address): Promise<PastTradesCheckResult> {
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
  const refCode = tradesByChainAndEnv
    .flat()
    .map((order) => getRefCodeFromAppData(extractFullAppDataFromOrder(order)))
    .find((code) => !!code)

  logAffiliate(
    safeShortenAddress(owner),
    `Called cow api, trader ${hasPastTrades ? 'has past trades' : 'does not have past trades'} and ref code ${
      refCode ? 'found' : 'not found'
    }`,
  )
  return {
    hasPastTrades,
    refCode,
  }
}
