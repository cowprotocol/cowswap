import { useEffect } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderStats } from './useAffiliateTraderStats'

import { AFFILIATE_EXPIRY_CHECK_INTERVAL_MS } from '../config/affiliateProgram.const'
import { toValidDate } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

export function useIsRefCodeExpired(): boolean {
  const { account } = useWalletInfo()
  const { data: stats } = useAffiliateTraderStats(account)

  const now = useMachineTimeMs(AFFILIATE_EXPIRY_CHECK_INTERVAL_MS)
  const rewardsEndTimestamp = toValidDate(stats?.rewards_end)?.getTime()

  const isExpired = !!rewardsEndTimestamp && rewardsEndTimestamp < now

  useEffect(() => {
    if (!!account && isExpired) logAffiliate(safeShortenAddress(account), 'Ref code is expired')
  }, [account, isExpired])

  return isExpired
}
