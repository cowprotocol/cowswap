import { Address } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'

import { safeShortenAddress } from '../../../utils/address'
import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

export async function checkIfTraderHasPastTrades(owner: Address): Promise<boolean> {
  logAffiliate(safeShortenAddress(owner), 'Calling cow api for each supported chain to check for executed trades')

  const tradesByChain = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.map((chainId) => getTrades({ owner, limit: 1 }, { chainId })),
  )

  const hasPastTrades = tradesByChain.some((trades) => trades.length > 0)
  logAffiliate(
    safeShortenAddress(owner),
    `Called cow api, trader ${hasPastTrades ? 'has past trades' : 'does not have past trades'}`,
  )
  return hasPastTrades
}
