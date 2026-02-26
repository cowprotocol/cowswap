import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
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
              <MetricValue>{isLinked && stats ? formatShortDate(stats.linked_since) : '-'}</MetricValue>
            </MetricItem>
            <MetricItem>
              <span>
                <Trans>Rewards end</Trans>
              </span>
              <MetricValue>{isLinked && stats ? formatShortDate(stats.rewards_end) : '-'}</MetricValue>
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
