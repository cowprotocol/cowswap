import { Address } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'
import { safeShortenAddress } from 'utils/address'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { AppDataOrder, extractFullAppDataFromOrder, getRefCodeFromAppData } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

export async function findRefCodeInPastTrades(account: Address): Promise<string | undefined> {
  const codesByChain = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      try {
        const trades = (await getTrades({ owner: account, limit: 1 }, { chainId })) as unknown as AppDataOrder[]

        return trades.map((trade) => getRefCodeFromAppData(extractFullAppDataFromOrder(trade)))
      } catch (error) {
        logAffiliate(safeShortenAddress(account), 'Failed to fetch trades for referral recovery', error, { chainId })
        return []
      }
    }),
  )

  return codesByChain.flat().find((code) => !!code)
}
