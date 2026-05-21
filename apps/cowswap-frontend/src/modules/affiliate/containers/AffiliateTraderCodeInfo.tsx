import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import svgOrderCheckSrc from '@cowprotocol/assets/cow-swap/order-check.svg'
import iconLocked2Src from '@cowprotocol/assets/images/icon-locked-2.svg'
import { IS_BFF_STAGING } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, CopyButton, HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'
import SVG from 'react-inlinesvg'

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

  if (!codeLoading && !info && savedCode) {
    return <CodeNotFound savedCode={savedCode} />
  }

  return (
    <ColumnOneCard showLoader={statsLoading || codeLoading}>
      {!info || !savedCode ? null : (
        <>
          <RewardsHeader>
            <CardTitle>
              {isLinked && !isExpired ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}
            </CardTitle>
          </RewardsHeader>
          <LinkedCard $isExpired={isExpired}>
            <LinkedCodeRow $isExpired={isExpired}>
              <LinkedCopy>
                <CopyButton value={savedCode} iconSize={16} iconOnly />
                <LinkedCodeText>{savedCode}</LinkedCodeText>
              </LinkedCopy>
              {isExpired ? (
                <ExpiredBadge>
                  <Trans>Expired</Trans>
                </ExpiredBadge>
              ) : isLinked ? (
                <LinkedBadge>
                  <SVG src={iconLocked2Src} width={16} height={16} />
                  <Trans>Linked</Trans>
                </LinkedBadge>
              ) : (
                <ValidBadge>
                  <SVG src={svgOrderCheckSrc} />
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

function CodeNotFound({ savedCode }: { savedCode: string }): ReactNode {
  return (
    <div>
      <ColumnOneCard>
        <RewardsHeader>
          <CardTitle>
            <Trans>Referral code</Trans>
          </CardTitle>
        </RewardsHeader>
        <LinkedCard $isExpired>
          <LinkedCodeRow $isExpired>
            <LinkedCopy>
              <CopyButton value={savedCode} iconSize={16} iconOnly />
              <LinkedCodeText>{savedCode}</LinkedCodeText>
            </LinkedCopy>
          </LinkedCodeRow>
        </LinkedCard>
        <HeroActions>
          <LinkedMetaList>
            <MetricItem>
              <span>
                The code you used in your past orders was not found in our {IS_BFF_STAGING ? 'staging' : 'production'}{' '}
                backend.
              </span>
            </MetricItem>
          </LinkedMetaList>
        </HeroActions>
      </ColumnOneCard>
    </div>
  )
}
