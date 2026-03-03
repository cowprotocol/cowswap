import { Address, CowEnv } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'
import { safeShortenAddress } from 'utils/address'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { AppDataOrder, extractFullAppDataFromOrder, getRefCodeFromAppData } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

const TRADE_ENVS_TO_CHECK: CowEnv[] = ['prod', 'staging']

export async function findRefCodeInPastTrades(owner: Address): Promise<string | undefined> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain/env to recover ref code')

  const codesByChainAndEnv = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.flatMap((chainId) =>
      TRADE_ENVS_TO_CHECK.map(async (env) => {
        try {
          const trades = (await getTrades({ owner, limit: 1 }, { chainId, env })) as unknown as AppDataOrder[]

          return trades.map((trade) => getRefCodeFromAppData(extractFullAppDataFromOrder(trade)))
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
