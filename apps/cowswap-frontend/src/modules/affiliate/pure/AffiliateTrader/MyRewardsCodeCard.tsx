import { ReactElement } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { TraderWalletStatus } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { TraderStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import {
  CardTitle,
  HeroActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
  MetricItem,
  RewardsCol1Card,
  RewardsHeader,
  ValidStatusBadge,
} from 'modules/affiliate/pure/shared'

interface MyRewardsCodeCardProps {
  loading: boolean
  isConnected: boolean
  walletStatus: TraderWalletStatus
  linkedCode?: string
  savedCode?: string
  traderStats?: TraderStatsResponse
  onEditCode: () => void
}

interface CodeCardViewModel {
  isLinked: boolean
  traderCode: string
  linkedSinceLabel: string
  rewardsEndLabel: string
}

function getTraderCode(params: {
  isConnected: boolean
  statsLinkedCode?: string
  linkedWalletCode?: string
  savedCode?: string
}): string {
  const { isConnected, statsLinkedCode, linkedWalletCode, savedCode } = params
  if (!isConnected) return '-'

  return statsLinkedCode ?? linkedWalletCode ?? savedCode ?? '-'
}

function getCodeCardViewModel(params: {
  isConnected: boolean
  walletStatus: TraderWalletStatus
  linkedCode?: string
  savedCode?: string
  traderStats?: TraderStatsResponse
}): CodeCardViewModel {
  const { isConnected, walletStatus, linkedCode, savedCode, traderStats } = params
  const statsLinkedCode = traderStats?.bound_referrer_code
  const isLinked = Boolean(statsLinkedCode) || walletStatus === TraderWalletStatus.LINKED
  const linkedWalletCode = walletStatus === TraderWalletStatus.LINKED ? linkedCode : undefined

  return {
    isLinked,
    traderCode: getTraderCode({ isConnected, statsLinkedCode, linkedWalletCode, savedCode }),
    linkedSinceLabel: formatShortDate(traderStats?.linked_since) ?? '-',
    rewardsEndLabel: formatShortDate(traderStats?.rewards_end) ?? '-',
  }
}

export function MyRewardsCodeCard({
  loading,
  isConnected,
  walletStatus,
  linkedCode,
  savedCode,
  traderStats,
  onEditCode,
}: MyRewardsCodeCardProps): ReactElement {
  const { isLinked, traderCode, linkedSinceLabel, rewardsEndLabel } = getCodeCardViewModel({
    isConnected,
    walletStatus,
    linkedCode,
    savedCode,
    traderStats,
  })

  return (
    <RewardsCol1Card showLoader={loading}>
      <RewardsHeader>
        <CardTitle>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</CardTitle>
      </RewardsHeader>
      <LinkedCard>
        <LinkedCodeRow>
          <LinkedCodeText>{traderCode}</LinkedCodeText>
          {isLinked ? (
            <LinkedBadge>
              <SVG src={LockedIcon} width={12} height={10} />
              <Trans>Linked</Trans>
            </LinkedBadge>
          ) : (
            <ValidStatusBadge>
              <SVG src={CheckIcon} title={t`Valid`} />
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
          <strong>{isLinked ? linkedSinceLabel : '-'}</strong>
        </MetricItem>
        <MetricItem>
          <span>
            <Trans>Rewards end</Trans>
          </span>
          <strong>{isLinked ? rewardsEndLabel : '-'}</strong>
        </MetricItem>
      </LinkedMetaList>
      {!isLinked && (
        <HeroActions>
          <ButtonPrimary onClick={onEditCode}>
            <Trans>Edit code</Trans>
          </ButtonPrimary>
        </HeroActions>
      )}
    </RewardsCol1Card>
  )
}
