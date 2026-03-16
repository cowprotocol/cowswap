import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'
import SVG from 'react-inlinesvg'

import CopyHelper from 'legacy/components/Copy'

import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { useIsRefCodeExpired } from '../hooks/useIsRefCodeExpired'
import { getApproxNextStatsUpdateAt, toValidDate } from '../lib/affiliateProgramUtils'
import {
  CardTitle,
  HeroActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedCopy,
  LinkedMetaList,
  MetricItem,
  MetricValue,
  ColumnOneCard,
  RewardsHeader,
  ValidBadge,
  ExpiredBadge,
} from '../pure/shared'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

const TIME_AGO_UPDATE_INTERVAL_MS = ms`1m`

export function AffiliateTraderCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const { data: stats, isLoading: statsLoading } = useAffiliateTraderStats(account)
  const { data: info, isLoading: codeLoading } = useAffiliateTraderInfo(savedCode)
  const isExpired = useIsRefCodeExpired()

  const approxNextUpdateAt = useMemo(() => getApproxNextStatsUpdateAt(), [])
  const approxNextUpdateTimeAgo = useTimeAgo(approxNextUpdateAt, TIME_AGO_UPDATE_INTERVAL_MS)

  return (
    <ColumnOneCard showLoader={statsLoading || codeLoading}>
      {!info ? null : (
        <>
          <RewardsHeader>
            <CardTitle>
              {isLinked && !isExpired ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}
            </CardTitle>
          </RewardsHeader>
          <LinkedCard $isExpired={isExpired}>
            <LinkedCodeRow $isExpired={isExpired}>
              <LinkedCopy>
                <CopyHelper toCopy={savedCode!} iconSize={16} hideCopiedLabel />
                <LinkedCodeText>{savedCode}</LinkedCodeText>
              </LinkedCopy>
              {isExpired ? (
                <ExpiredBadge>
                  <Trans>Expired</Trans>
                </ExpiredBadge>
              ) : isLinked ? (
                <LinkedBadge>
                  <SVG src={LockedIcon} width={16} height={16} />
                  <Trans>Linked</Trans>
                </LinkedBadge>
              ) : (
                <ValidBadge>
                  <SVG src={CheckIcon} />
                  <Trans>Valid</Trans>
                </ValidBadge>
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
                ) : isLinked ? (
                  <HelpTooltip text={<Trans>Will be updated {approxNextUpdateTimeAgo}</Trans>} />
                ) : (
                  '-'
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
                ) : isLinked ? (
                  <HelpTooltip text={<Trans>Will be updated {approxNextUpdateTimeAgo}</Trans>} />
                ) : (
                  '-'
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
