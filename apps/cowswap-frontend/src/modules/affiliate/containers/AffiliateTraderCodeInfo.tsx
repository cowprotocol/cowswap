import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { getApproxNextStatsUpdateAt, toValidDate } from '../lib/affiliateProgramUtils'
import { LinkedBadge, ValidStatusBadge } from '../pure/AffiliateBadges.shared'
import {
  HeroActions,
  ColumnOneCard,
  CardTitle,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
} from '../pure/AffiliateCards.shared'
import { MetricItem } from '../pure/AffiliateMetrics.shared'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const { data: stats, isLoading: statsLoading } = useAffiliateTraderStats(account + '1')
  const { data: info, isLoading: codeLoading } = useAffiliateTraderInfo(savedCode)

  const approxNextUpdateAt = useMemo(() => getApproxNextStatsUpdateAt(), [])
  const approxNextUpdateTimeAgo = useTimeAgo(approxNextUpdateAt, 60_000)
  const missingValueTooltip = t`This will update ${approxNextUpdateTimeAgo}.`

  return (
    <ColumnOneCard showLoader={statsLoading || codeLoading}>
      {!info ? null : (
        <>
          <CardTitle>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</CardTitle>
          <LinkedCard>
            <LinkedCodeRow>
              <LinkedCodeText>{savedCode}</LinkedCodeText>
              {isLinked ? (
                <LinkedBadge>
                  <SVG src={LockedIcon} width={12} height={10} />
                  <Trans>Linked</Trans>
                </LinkedBadge>
              ) : (
                <ValidStatusBadge>
                  <SVG src={CheckIcon} />
                  <Trans>Valid</Trans>
                </ValidStatusBadge>
              )}
            </LinkedCodeRow>
          </LinkedCard>
          <LinkedMetaList>
            <MetricItem>
              <span>
                <Trans>Linked since</Trans>
              </span>
              <strong>
                {!stats ? (
                  <HelpTooltip text={missingValueTooltip} />
                ) : (
                  <span title={formatDateWithTimezone(toValidDate(stats.linked_since))}>
                    {formatShortDate(stats.linked_since)}
                  </span>
                )}
              </strong>
            </MetricItem>
            <MetricItem>
              <span>
                <Trans>Rewards end</Trans>
              </span>
              <strong>
                {!stats ? (
                  <HelpTooltip text={missingValueTooltip} />
                ) : (
                  <span title={formatDateWithTimezone(toValidDate(stats.rewards_end))}>
                    {formatShortDate(stats.rewards_end)}
                  </span>
                )}
              </strong>
            </MetricItem>
          </LinkedMetaList>
          {!isLinked && (
            <HeroActions>
              <ButtonPrimary onClick={toggleAffiliateModal}>
                <Trans>Edit code</Trans>
              </ButtonPrimary>
            </HeroActions>
          )}
        </>
      )}
    </ColumnOneCard>
  )
}
