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

export async function findRefCodeInPastTrades(owner: Address): Promise<string | undefined> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain/env to recover ref code')

  const codesByChainAndEnv = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.flatMap((chainId) =>
      TRADE_ENVS_TO_CHECK.map(async (env) => {
        try {
          const orders = await getOrders({ owner, limit: PAST_ORDERS_SCAN_LIMIT }, { chainId, env })
          return orders
            .filter(isExecutedNonIntegratorOrder)
            .map((order) => getRefCodeFromAppData(extractFullAppDataFromOrder(order)))
        } catch (error) {
          logAffiliate(safeShortenAddress(owner), 'Failed to fetch trades for ref code recovery', error, {
            chainId,
            env,
          })

          return []
        }
      }),
    ),
  )

  const code = codesByChainAndEnv.flat().find((code) => !!code)

  logAffiliate(safeShortenAddress(owner), `Called cow api, ref code ${code ? 'found' : 'not found'}`)
  return code
}
