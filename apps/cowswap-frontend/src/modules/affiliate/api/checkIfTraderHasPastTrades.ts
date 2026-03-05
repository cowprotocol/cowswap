import { Address, CowEnv } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'

import { safeShortenAddress } from '../../../utils/address'
import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

const TRADE_ENVS_TO_CHECK: CowEnv[] = ['prod', 'staging']

export async function checkIfTraderHasPastTrades(owner: Address): Promise<boolean> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain/env to check for executed trades')

  const tradesByChainAndEnv = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.flatMap((chainId) =>
      TRADE_ENVS_TO_CHECK.map(async (env) => {
        try {
          return await getTrades({ owner, limit: 1 }, { chainId, env })
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

  const hasPastTrades = tradesByChainAndEnv.some((trades) => trades.length > 0)
  logAffiliate(
    safeShortenAddress(owner),
    `Called cow api, trader ${hasPastTrades ? 'has past trades' : 'does not have past trades'}`,
  )
  return hasPastTrades
}
