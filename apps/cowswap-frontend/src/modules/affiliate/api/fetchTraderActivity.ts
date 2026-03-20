import { Address, EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'
import { safeShortenAddress } from 'utils/address'

import {
  AFFILIATE_SUPPORTED_CHAIN_IDS,
  TRADE_ENVS_TO_CHECK,
  ACTIVITY_SCAN_LIMIT,
} from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

export interface OrderWithChainId extends EnrichedOrder {
  chainId: SupportedChainId
}

export async function fetchTraderActivity(owner: Address): Promise<OrderWithChainId[]> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain/env to retrieve activity')
  const allOrders = (
    await Promise.all(
      AFFILIATE_SUPPORTED_CHAIN_IDS.flatMap((chainId) =>
        TRADE_ENVS_TO_CHECK.map(async (env) => {
          try {
            const orders = await getOrders(
              {
                owner,
                limit: ACTIVITY_SCAN_LIMIT,
              },
              { chainId, env },
            )

            return orders.map((order) => ({ ...order, chainId }))
          } catch (error) {
            logAffiliate(safeShortenAddress(owner), 'Failed to fetch trades while retrieving history', error, {
              chainId,
              env,
            })
            return []
          }
        }),
      ),
    )
  ).flat()

  logAffiliate(
    safeShortenAddress(owner),
    `Called cow api for each supported chain/env to retrieve activity, found ${allOrders.length} orders`,
  )

  return allOrders
}
