import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { delay } from '@cowprotocol/common-utils'

import useSWR from 'swr'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { TraderStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import { setTraderReferralSavedCodeAtom } from 'modules/affiliate/state/affiliateTraderWriteAtoms'

const MIN_LOADING_MS = 200
const SWR_KEY = 'affiliate-trader-stats'
type AffiliateTraderStatsKey = readonly [typeof SWR_KEY, string]

interface UseAffiliateTraderRewardsStatsParams {
  account?: string
  currentSavedCode?: string
}

interface UseAffiliateTraderRewardsStatsResult {
  traderStats: TraderStatsResponse | undefined
  loading: boolean
}

export function useAffiliateTraderRewardsStats(
  params: UseAffiliateTraderRewardsStatsParams,
): UseAffiliateTraderRewardsStatsResult {
  const { account, currentSavedCode } = params
  const setSavedCode = useSetAtom(setTraderReferralSavedCodeAtom)
  const key = useMemo<AffiliateTraderStatsKey | null>(() => (account ? ([SWR_KEY, account] as const) : null), [account])
  const { data, isLoading } = useSWR<TraderStatsResponse | undefined>(key, async ([, traderAccount]) => {
    const [stats] = await Promise.all([bffAffiliateApi.getTraderStats(traderAccount), delay(MIN_LOADING_MS)])
    return stats ?? undefined
  })

  useEffect(() => {
    const linkedCode = data?.bound_referrer_code
    if (!linkedCode || linkedCode === currentSavedCode) {
      return
    }

    setSavedCode(linkedCode)
  }, [currentSavedCode, data?.bound_referrer_code, setSavedCode])

  return {
    traderStats: data,
    loading: !!account && isLoading,
  }
}
