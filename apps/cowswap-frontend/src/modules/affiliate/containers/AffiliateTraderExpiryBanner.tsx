import { ReactNode } from 'react'

import { useMachineTimeMs, useTimeAgo } from '@cowprotocol/common-hooks'
import { formatShortDate } from '@cowprotocol/common-utils'
import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'

import { AFFILIATE_EXPIRY_CHECK_INTERVAL_MS } from '../config/affiliateProgram.const'
import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { toValidDate } from '../lib/affiliateProgramUtils'

const PRE_EXPIRY_WINDOW_MS = ms`24h`

export function AffiliateTraderExpiryBanner(): ReactNode {
  const { account } = useWalletInfo()
  const { data: stats, isLoading } = useAffiliateTraderStats(account)

  const rewardsEnd = toValidDate(stats?.rewards_end)
  const now = useMachineTimeMs(AFFILIATE_EXPIRY_CHECK_INTERVAL_MS)
  const timeAgo = useTimeAgo(rewardsEnd ?? undefined, AFFILIATE_EXPIRY_CHECK_INTERVAL_MS)
  const rewardsEndTimestamp = rewardsEnd?.getTime()
  const isExpired = !!rewardsEndTimestamp && rewardsEndTimestamp <= now
  const isPreExpiry =
    !!rewardsEndTimestamp && rewardsEndTimestamp > now && rewardsEndTimestamp - now <= PRE_EXPIRY_WINDOW_MS

  useAffiliateStateViewAnalytics({
    action: 'affiliate_trader_expired_code_viewed',
    viewKey: isExpired ? stats?.rewards_end : undefined,
    eventParams: isExpired
      ? {
          rewardsEnd: stats?.rewards_end,
        }
      : undefined,
  })

  if (isLoading || !rewardsEnd) {
    return null
  }
  const rewardsEndLabel = formatShortDate(rewardsEnd)

  if (!rewardsEndLabel) {
    return null
  }

  if (!isExpired && !isPreExpiry) {
    return null
  }

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} paperBackground>
      {isExpired ? (
        <Trans>Your referral code expired on {rewardsEndLabel}.</Trans>
      ) : (
        <Trans>Your referral code expires {timeAgo}. Trade now to maximize your rewards.</Trans>
      )}
    </InlineBanner>
  )
}
