import { Address } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

export async function checkIfTraderHasPastTrades(owner: Address): Promise<boolean> {
  logAffiliate('calling cow api for each supported chain to check for executed trades. trader:', owner)

  const tradesByChain = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.map((chainId) => getTrades({ owner, limit: 1 }, { chainId })),
  )

  const hasPastTrades = tradesByChain.some((trades) => trades.length > 0)
  logAffiliate('called cow api. trader:', owner, hasPastTrades ? 'has past trades' : 'does not have past trades')
  return hasPastTrades
}
