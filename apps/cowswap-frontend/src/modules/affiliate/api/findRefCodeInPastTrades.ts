import { Address } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol'
import { safeShortenAddress } from 'utils/address'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { AppDataOrder, extractFullAppDataFromOrder, getRefCodeFromAppData } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

export async function findRefCodeInPastTrades(account: Address): Promise<string | undefined> {
  try {
    for (const chainId of AFFILIATE_SUPPORTED_CHAIN_IDS) {
      const trades = (await getTrades({ owner: account, limit: 1 }, { chainId })) as unknown as AppDataOrder[]

      for (const order of trades) {
        const code = getRefCodeFromAppData(extractFullAppDataFromOrder(order))

        if (code) return code
      }
    }

    return undefined
  } catch (error) {
    logAffiliate(safeShortenAddress(account), 'Failed to fetch trades for referral recovery', error)
    return undefined
  }
}
