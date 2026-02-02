import { useCallback, useEffect, useMemo, useState } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { ArrowLeft, Lock } from 'react-feather'
import styled from 'styled-components/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getIncomingIneligibleCode,
} from 'modules/affiliate/lib/affiliate-program-utils'
import { useReferral } from 'modules/affiliate/model/hooks/useReferral'
import { useReferralActions } from 'modules/affiliate/model/hooks/useReferralActions'
import { TraderStatsResponse } from 'modules/affiliate/model/types'
import { ReferralIneligibleCopy } from 'modules/affiliate/ui/ReferralIneligibleCopy'
import {
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  ReferralTermsFaqLinks,
  RewardsCol1Card,
  RewardsCol2Card,
  MetricItem,
  RewardsMetricsList,
  RewardsMetricsRow,
  NextPayoutCard,
  RewardsThreeColumnGrid,
  RewardsWrapper,
} from 'modules/affiliate/ui/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useNavigateBack } from 'common/hooks/useNavigate'
import { Card } from 'pages/Account/styled'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function, complexity
export default function AccountMyRewards() {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const referral = useReferral()
  console.log('📜 LOG > AccountMyRewards > referral:', referral)
  const referralActions = useReferralActions()
  const navigateBack = useNavigateBack()
  const [traderStats, setTraderStats] = useState<TraderStatsResponse | null>(null)
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const isConnected = Boolean(account)
  const incomingIneligibleCode = getIncomingIneligibleCode(referral.incomingCode, referral.verification)

  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), [])
  const formatNumber = useCallback(
    (value: number | null | undefined) => (value === null || value === undefined ? '-' : numberFormatter.format(value)),
    [numberFormatter],
  )

  useEffect(() => {
    let cancelled = false

    if (!account) {
      setTraderStats(null)
      setStatsUpdatedAt(null)
      setStatsLoading(false)
      return
    }

    setStatsLoading(true)
    bffAffiliateApi
      .getTraderStats(account)
      .then((stats) => {
        if (cancelled) {
          return
        }

        setTraderStats(stats)
        const updated = stats?.lastUpdatedAt ? new Date(stats.lastUpdatedAt) : null
        setStatsUpdatedAt(updated && !Number.isNaN(updated.getTime()) ? updated : null)
        if (stats?.bound_referrer_code && referral.savedCode !== stats.bound_referrer_code) {
          referralActions.setSavedCode(stats.bound_referrer_code)
          referralActions.setWalletState({ status: 'linked', code: stats.bound_referrer_code })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTraderStats(null)
          setStatsUpdatedAt(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [account, referral.savedCode, referralActions])

  const statsReady = Boolean(traderStats)
  console.log('📜 LOG > AccountMyRewards > traderStats:', traderStats)
  const statsLinkedCode = traderStats?.bound_referrer_code
  const isLinked = Boolean(statsLinkedCode) || referral.wallet.status === 'linked'
  console.log('📜 LOG > AccountMyRewards > isLinked:', isLinked)
  const isIneligible = referral.wallet.status === 'ineligible' && isConnected && !statsLinkedCode
  const programParams =
    referral.verification.kind === 'valid'
      ? referral.verification.programParams
      : referral.previousVerification?.kind === 'valid'
        ? referral.previousVerification.programParams
        : undefined
  const rewardAmountLabel = programParams ? formatUsdCompact(programParams?.traderRewardAmount) : 'reward'
  const traderCode = isConnected
    ? statsLinkedCode
      ? statsLinkedCode
      : isLinked
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (referral as any).wallet.code
        : (referral.savedCode ?? (referral.verification.kind === 'valid' ? referral.verification.code : undefined))
    : undefined
  const traderHasCode = Boolean(traderCode)
  const triggerVolume =
    statsReady && typeof traderStats?.trigger_volume === 'number' ? traderStats.trigger_volume : null
  const leftToNextRewards = statsReady ? traderStats?.left_to_next_rewards : undefined
  const progressToNextReward =
    triggerVolume !== null && leftToNextRewards !== undefined ? Math.max(triggerVolume - leftToNextRewards, 0) : 0
  const rewardsProgressPercent = triggerVolume
    ? Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
    : 0
  const rewardsProgressLabel = triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0)
  const triggerVolumeLabel = triggerVolume !== null ? formatUsdCompact(triggerVolume) : formatUsdCompact(0)
  const leftToNextRewardLabel = statsReady ? formatUsdCompact(leftToNextRewards) : '-'
  const totalEarnedLabel = statsReady ? formatUsdcCompact(traderStats?.total_earned) : '-'
  const claimedLabel = statsReady ? formatUsdcCompact(traderStats?.paid_out) : '-'
  const nextPayoutValue = traderStats?.next_payout
  const nextPayoutLabel =
    statsReady && nextPayoutValue !== null && nextPayoutValue !== undefined
      ? `${formatNumber(nextPayoutValue)} USDC`
      : formatUsdcCompact(0)
  const linkedSinceLabel = formatShortDate(traderStats?.linked_since) ?? '-'
  const rewardsEndLabel = formatShortDate(traderStats?.rewards_end) ?? '-'
  const statsUpdatedLabel = useTimeAgo(statsUpdatedAt ?? undefined, 60_000)
  const statsUpdatedAbsoluteLabel = formatUpdatedAt(statsUpdatedAt)
  const statsUpdatedDisplay = statsUpdatedLabel || '-'
  const statsUpdatedText = i18n._(t`Last updated: ${statsUpdatedDisplay}`)
  const statsUpdatedTitle = statsUpdatedAbsoluteLabel !== '-' ? statsUpdatedAbsoluteLabel : undefined

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
                Use a referral code to earn a flat fee for
                <br />
                the eligible volume done through the app.
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
            <RewardsCol1Card showLoader={statsLoading}>
              <Header>
                <CardTitle>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</CardTitle>
              </Header>
              <LinkedCard>
                <LinkedCodeRow>
                  <LinkedCodeText>{traderCode}</LinkedCodeText>
                  {isLinked ? (
                    <LinkedStatusBadge>
                      <Lock size={14} />
                      <Trans>Linked</Trans>
                    </LinkedStatusBadge>
                  ) : (
                    <Trans>Pending</Trans>
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
              <HeroActions>
                <ButtonPrimary onClick={handleOpenRewardsModal}>
                  <Trans>Edit code</Trans>
                </ButtonPrimary>
              </HeroActions>
            </RewardsCol1Card>

            <RewardsCol2Card showLoader={statsLoading}>
              <CardTitle>
                <Trans>Next {rewardAmountLabel} reward</Trans>
              </CardTitle>
              <RewardsMetricsRow>
                <RewardsMetricsList>
                  <MetricItem>
                    <span>
                      <Trans>Left to next {rewardAmountLabel}</Trans>
                    </span>
                    <strong>{leftToNextRewardLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Total earned</Trans>
                    </span>
                    <strong>{totalEarnedLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Claimed</Trans>
                    </span>
                    <strong>{claimedLabel}</strong>
                  </MetricItem>
                </RewardsMetricsList>
                <Donut $value={rewardsProgressPercent}>
                  <DonutValue>
                    <span>{rewardsProgressLabel}</span>
                    <small>
                      <Trans>of</Trans> {triggerVolumeLabel}
                    </small>
                  </DonutValue>
                </Donut>
              </RewardsMetricsRow>
              <BottomMetaRow>
                <span title={statsUpdatedTitle}>{statsUpdatedText}</span>
              </BottomMetaRow>
            </RewardsCol2Card>

            <NextPayoutCard payoutLabel={nextPayoutLabel} showLoader={statsLoading} />
          </RewardsThreeColumnGrid>
        </>
      )}
    </RewardsWrapper>
  )
}

function formatUpdatedAt(value: Date | null): string {
  if (!value) {
    return '-'
  }

  return formatDateWithTimezone(value) ?? '-'
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

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const LinkedCard = styled.div`
  border: 1px solid var(${UI.COLOR_INFO_BG});
  background: var(${UI.COLOR_PAPER});
  border-radius: 9px;
  overflow: hidden;
  width: 100%;
`

const LinkedCodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
`

const LinkedCodeText = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 18px;
  white-space: nowrap;
  color: var(${UI.COLOR_INFO_TEXT});
`

const LinkedStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`

const LinkedMetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  width: 100%;
`
