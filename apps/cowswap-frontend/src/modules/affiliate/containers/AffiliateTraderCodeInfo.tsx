import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import {
  CardTitle,
  HeroActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
  MetricItem,
  ColumnOneCard,
  RewardsHeader,
  ValidStatusBadge,
} from '../pure/shared'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { savedCode, isLinked } = useAtomValue(affiliateTraderAtom)
  const toggleAffiliateModal = useToggleAffiliateModal()

  const { data: stats, isLoading } = useAffiliateTraderStats(account)

  return (
    <ColumnOneCard showLoader={isLoading}>
      {!stats ? null : (
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
              <strong>{isLinked ? formatShortDate(stats.linked_since) : '-'}</strong>
            </MetricItem>
            <MetricItem>
              <span>
                <Trans>Rewards end</Trans>
              </span>
              <strong>{isLinked ? formatShortDate(stats.rewards_end) : '-'}</strong>
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
