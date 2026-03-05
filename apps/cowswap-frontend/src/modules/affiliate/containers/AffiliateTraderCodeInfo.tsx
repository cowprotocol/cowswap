import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { getApproxNextStatsUpdateAt, toValidDate } from '../lib/affiliateProgramUtils'
import {
  CardTitle,
  HeroActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
  MetricItem,
  MetricValue,
  ColumnOneCard,
  RewardsHeader,
  ValidStatusBadge,
} from '../pure/shared'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const { data: stats, isLoading: statsLoading } = useAffiliateTraderStats(account)
  const { data: info, isLoading: codeLoading } = useAffiliateTraderInfo(savedCode)

  const approxNextUpdateAt = useMemo(() => getApproxNextStatsUpdateAt(), [])
  const approxNextUpdateTimeAgo = useTimeAgo(approxNextUpdateAt, 60_000)

  return (
    <ColumnOneCard showLoader={statsLoading || codeLoading}>
      {!info ? null : (
        <>
          <RewardsHeader>
            <CardTitle>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</CardTitle>
          </RewardsHeader>
          <LinkedCard>
            <LinkedCodeRow>
              <LinkedCodeText>{savedCode}</LinkedCodeText>
              {isLinked ? (
                <LinkedBadge>
                  <SVG src={LockedIcon} width={16} height={16} />
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
              <MetricValue>
                {stats && toValidDate(stats.linked_since) ? (
                  <span title={formatDateWithTimezone(toValidDate(stats.linked_since))}>
                    {formatShortDate(stats.linked_since)}
                  </span>
                ) : (
                  <HelpTooltip text={<Trans>This will update {approxNextUpdateTimeAgo}</Trans>} />
                )}
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <span>
                <Trans>Rewards end</Trans>
              </span>
              <MetricValue>
                {stats && toValidDate(stats.rewards_end) ? (
                  <span title={formatDateWithTimezone(toValidDate(stats.rewards_end))}>
                    {formatShortDate(stats.rewards_end)}
                  </span>
                ) : (
                  <HelpTooltip text={<Trans>This will update {approxNextUpdateTimeAgo}</Trans>} />
                )}
              </MetricValue>
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
