import { useCallback, useEffect, useMemo, useState } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { ButtonPrimary, ButtonSecondary, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api'
import { getIncomingIneligibleCode } from 'modules/affiliate/lib/affiliate-program-utils'
import { useReferral } from 'modules/affiliate/model/hooks/useReferral'
import { useReferralActions } from 'modules/affiliate/model/hooks/useReferralActions'
import { TraderStatsResponse } from 'modules/affiliate/model/types'
import { ReferralIneligibleCopy } from 'modules/affiliate/ui/ReferralIneligibleCopy'
import {
  Badge,
  CardHeader,
  CardTitle,
  ClaimValue,
  CodeBadge,
  DonutValue,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InfoItem,
  InfoList,
  InlineActions,
  InlineNote,
  LinkedHeader,
  ReferralTermsFaqLinks,
  RewardsCol1Card,
  RewardsCol2Card,
  RewardsCol3Card,
  RewardsDonut,
  RewardsMetricItem,
  RewardsMetricsList,
  RewardsMetricsRow,
  RewardsThreeColumnGrid,
  RewardsWrapper,
} from 'modules/affiliate/ui/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useNavigateBack } from 'common/hooks/useNavigate'
import { Card } from 'pages/Account/styled'

const DEFAULT_REWARDS_TARGET = 50_000

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function, complexity
export default function AccountMyRewards() {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const referral = useReferral()
  const referralActions = useReferralActions()
  const navigateBack = useNavigateBack()
  const [traderStats, setTraderStats] = useState<TraderStatsResponse | null>(null)

  const isConnected = Boolean(account)
  const incomingIneligibleCode = getIncomingIneligibleCode(referral.incomingCode, referral.verification)

  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), [])
  const compactFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }),
    [],
  )
  const formatUsd = useCallback(
    (value: number | null | undefined) =>
      value === null || value === undefined ? '-' : `$${compactFormatter.format(value)}`,
    [compactFormatter],
  )
  const formatUsdc = useCallback(
    (value: number | null | undefined) =>
      value === null || value === undefined ? '-' : `${compactFormatter.format(value)} USDC`,
    [compactFormatter],
  )
  const formatNumber = useCallback(
    (value: number | null | undefined) => (value === null || value === undefined ? '-' : numberFormatter.format(value)),
    [numberFormatter],
  )

  useEffect(() => {
    let cancelled = false

    if (!account) {
      setTraderStats(null)
      return
    }

    bffAffiliateApi
      .getTraderStats(account)
      .then((stats) => {
        if (cancelled) {
          return
        }

        setTraderStats(stats)
        if (stats?.bound_referrer_code && referral.savedCode !== stats.bound_referrer_code) {
          referralActions.setSavedCode(stats.bound_referrer_code)
          referralActions.setWalletState({ status: 'linked', code: stats.bound_referrer_code })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTraderStats(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [account, referral.savedCode, referralActions])

  const statsReady = Boolean(traderStats)
  const statsLinkedCode = traderStats?.bound_referrer_code
  const isLinked = Boolean(statsLinkedCode) || referral.wallet.status === 'linked'
  const isIneligible = referral.wallet.status === 'ineligible' && isConnected && !statsLinkedCode
  const traderCode = isConnected
    ? statsLinkedCode
      ? statsLinkedCode
      : isLinked
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (referral as any).wallet.code
        : (referral.savedCode ?? (referral.verification.kind === 'valid' ? referral.verification.code : undefined))
    : undefined
  const traderHasCode = Boolean(traderCode)
  const triggerVolume = traderStats?.trigger_volume ?? DEFAULT_REWARDS_TARGET
  const leftToNextRewards = traderStats?.left_to_next_rewards
  const progressToNextReward =
    statsReady && leftToNextRewards !== undefined ? Math.max(triggerVolume - leftToNextRewards, 0) : 0
  const rewardsProgressPercent =
    statsReady && triggerVolume > 0 ? Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100)) : 0
  const rewardsProgressLabel = statsReady ? formatUsd(progressToNextReward) : '-'
  const triggerVolumeLabel = statsReady ? formatUsd(triggerVolume) : '-'
  const leftToNextRewardLabel = statsReady ? formatUsd(leftToNextRewards) : '-'
  const totalEarnedLabel = statsReady ? formatUsdc(traderStats?.total_earned) : '-'
  const claimedLabel = statsReady ? formatUsdc(traderStats?.paid_out) : '-'
  const nextPayoutLabel = statsReady ? formatNumber(traderStats?.next_payout) : '-'
  const linkedSinceLabel = formatStatsDate(traderStats?.linked_since)
  const rewardsEndLabel = formatStatsDate(traderStats?.rewards_end)

  const handleOpenRewardsModal = useCallback(() => {
    referralActions.openModal('rewards')
  }, [referralActions])

  const handleConnect = useCallback(() => {
    toggleWalletModal()
  }, [toggleWalletModal])

  const handleGoBack = useCallback(() => {
    navigateBack()
  }, [navigateBack])

  return (
    <RewardsWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

      {isIneligible ? (
        <IneligibleCard>
          <IneligibleHeader>
            <BackButton type="button" onClick={handleGoBack} aria-label="Go back">
              <ArrowLeft size={20} />
            </BackButton>
          </IneligibleHeader>
          <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />

          <IneligibleTitle>
            <Trans>Your wallet is ineligible</Trans>
          </IneligibleTitle>
          <IneligibleSubtitle>
            <ReferralIneligibleCopy incomingCode={incomingIneligibleCode} />
          </IneligibleSubtitle>
          <IneligibleActions>
            <ButtonPrimary onClick={handleGoBack}>
              <Trans>Go back</Trans>
            </ButtonPrimary>
          </IneligibleActions>
        </IneligibleCard>
      ) : !traderHasCode ? (
        <HeroCard>
          <HeroContent>
            <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
            <HeroTitle>
              <Trans>Earn while you trade</Trans>
            </HeroTitle>
            <HeroSubtitle>
              <Trans>
                Use a referral code to earn 10 USDC for
                <br />
                every $50k in eligible volume within 90 days.
                <br />
                New wallets only.
              </Trans>
            </HeroSubtitle>
            <HeroActions>
              {!isConnected ? (
                <ButtonPrimary onClick={handleConnect}>
                  <Trans>Connect wallet</Trans>
                </ButtonPrimary>
              ) : (
                <ButtonPrimary onClick={handleOpenRewardsModal}>
                  <Trans>Add code</Trans>
                </ButtonPrimary>
              )}
            </HeroActions>
            <ReferralTermsFaqLinks />
          </HeroContent>
        </HeroCard>
      ) : (
        <>
          <RewardsThreeColumnGrid>
            <RewardsCol1Card>
              <Header>
                <Title>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</Title>
              </Header>
              <LinkedHeader>
                <CodeBadge>{traderCode}</CodeBadge>
                {isLinked ? (
                  <Badge $tone="success">
                    <Trans>Linked</Trans>
                  </Badge>
                ) : (
                  <Badge $tone="info">
                    <Trans>Pending</Trans>
                  </Badge>
                )}
              </LinkedHeader>
              <InfoList>
                <InfoItem>
                  <span>
                    <Trans>Linked since</Trans>
                  </span>
                  <span>{isLinked ? linkedSinceLabel : '-'}</span>
                </InfoItem>
                <InfoItem>
                  <span>
                    <Trans>Rewards end</Trans>
                  </span>
                  <span>{isLinked ? rewardsEndLabel : '-'}</span>
                </InfoItem>
              </InfoList>
              <InlineActions>
                <ButtonSecondary onClick={handleOpenRewardsModal}>
                  <Trans>Edit code</Trans>
                </ButtonSecondary>
              </InlineActions>
            </RewardsCol1Card>

            <RewardsCol2Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Next $10 reward</Trans>
                </CardTitle>
              </CardHeader>
              <RewardsMetricsRow>
                <RewardsMetricsList>
                  <RewardsMetricItem>
                    <span>
                      <Trans>Left to next $10</Trans>
                    </span>
                    <strong>{leftToNextRewardLabel}</strong>
                  </RewardsMetricItem>
                  <RewardsMetricItem>
                    <span>
                      <Trans>Total earned</Trans>
                    </span>
                    <strong>{totalEarnedLabel}</strong>
                  </RewardsMetricItem>
                  <RewardsMetricItem>
                    <span>
                      <Trans>Claimed</Trans>
                    </span>
                    <strong>{claimedLabel}</strong>
                  </RewardsMetricItem>
                </RewardsMetricsList>
                <RewardsDonut $value={rewardsProgressPercent}>
                  <DonutValue>
                    <span>{rewardsProgressLabel}</span>
                    <small>
                      <Trans>of</Trans> {triggerVolumeLabel}
                    </small>
                  </DonutValue>
                </RewardsDonut>
              </RewardsMetricsRow>
            </RewardsCol2Card>

            <RewardsCol3Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Next payout</Trans>
                </CardTitle>
              </CardHeader>
              <ClaimValue>{nextPayoutLabel} USDC</ClaimValue>
              <InlineNote>
                <Trans>Paid weekly via airdrop.</Trans>
              </InlineNote>
            </RewardsCol3Card>
          </RewardsThreeColumnGrid>

          <FullWidthCard>
            <Content>
              <Header>
                <Title>
                  <Trans>Rewards activity</Trans>
                </Title>
                <Subtitle>
                  <Trans>Track completed rewards over time.</Trans>
                </Subtitle>
              </Header>
              <RewardsTable>
                <thead>
                  <tr>
                    <th>
                      <Trans>Trade</Trans>
                    </th>
                    <th>
                      <Trans>Date</Trans>
                    </th>
                    <th>
                      <Trans>Eligible volume</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3}>
                      <EmptyTableState>
                        <Trans>Your rewards activity will show here.</Trans>
                      </EmptyTableState>
                    </td>
                  </tr>
                </tbody>
              </RewardsTable>
            </Content>
          </FullWidthCard>
        </>
      )}
    </RewardsWrapper>
  )
}

function formatStatsDate(value?: string): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
}

const IneligibleCard = styled(Card)`
  max-width: 640px;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  position: relative;
`

const IneligibleHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
`

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  padding: 4px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

const IneligibleTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

const IneligibleSubtitle = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  max-width: 520px;

  strong {
    color: var(${UI.COLOR_TEXT});
  }
`

const IneligibleActions = styled.div`
  width: 100%;

  ${ButtonPrimary} {
    width: 100%;
  }
`

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  color: var(${UI.COLOR_TEXT});
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
  align-items: flex-start;
`

const RewardsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT});

  th,
  td {
    padding: 10px 0;
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    text-align: left;
  }

  th {
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

const EmptyTableState = styled.div`
  padding: 16px 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`
