import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useAffiliateTraderStats } from 'modules/affiliate/hooks/useAffiliateTraderStats'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { useToggleAffiliateModal } from 'modules/affiliate/hooks/useToggleAffiliateModal'
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
} from 'modules/affiliate/pure/shared'
import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'

interface CodeCardViewModel {
  isLinked: boolean
  traderCode: string
  linkedSinceLabel: string
  rewardsEndLabel: string
}

export function AffiliateTraderCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const toggleAffiliateModal = useToggleAffiliateModal()
  const { walletStatus } = useAffiliateTraderWallet({
    account,
    chainId,
    savedCode: affiliateTrader.savedCode,
  })
  const { data: traderStats, isLoading: loading } = useAffiliateTraderStats(account)
  const isLinked = walletStatus === TraderWalletStatus.LINKED
  const codeCardViewModel: CodeCardViewModel = {
    isLinked,
    traderCode: affiliateTrader.savedCode ?? '-',
    linkedSinceLabel: formatShortDate(traderStats?.linked_since) ?? '-',
    rewardsEndLabel: formatShortDate(traderStats?.rewards_end) ?? '-',
  }
  const { traderCode, linkedSinceLabel, rewardsEndLabel } = codeCardViewModel

  return (
    <ColumnOneCard showLoader={loading}>
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
          <ButtonPrimary onClick={toggleAffiliateModal}>
            <Trans>Edit code</Trans>
          </ButtonPrimary>
        </HeroActions>
      )}
    </ColumnOneCard>
  )
}
