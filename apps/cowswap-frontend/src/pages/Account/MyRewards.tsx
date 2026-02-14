import { useCallback, useEffect, useMemo, useState } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { delay, formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'
import SVG from 'react-inlinesvg'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import {
  AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS,
  AFFILIATE_REWARDS_UPDATE_LAG_HOURS,
  AFFILIATE_SUPPORTED_NETWORK_NAMES,
} from 'modules/affiliate/config/affiliateProgram.const'
import { useTraderReferralCode } from 'modules/affiliate/hooks/useTraderReferralCode'
import { useTraderReferralCodeActions } from 'modules/affiliate/hooks/useTraderReferralCodeActions'
import { TraderStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import {
  formatUsdcCompact,
  formatUsdCompact,
  getIncomingIneligibleCode,
  isSupportedReferralNetwork,
} from 'modules/affiliate/lib/affiliateProgramUtils'
import {
  AffiliateTermsFaqLinks,
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  IneligibleCard,
  IneligibleSubtitle,
  IneligibleTitle,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
  NextPayoutCard,
  RewardsCol1Card,
  RewardsCol2Card,
  RewardsHeader,
  RewardsMetricsList,
  RewardsMetricsRow,
  RewardsThreeColumnGrid,
  RewardsWrapper,
  MetricItem,
  UnsupportedNetworkCard,
  UnsupportedNetworkHeader,
  UnsupportedNetworkMessage,
  ValidStatusBadge,
  LabelContent,
} from 'modules/affiliate/pure/shared'
import { TraderReferralCodeIneligibleCopy } from 'modules/affiliate/pure/TraderReferralCodeIneligibleCopy'
import { TraderReferralCodeNetworkBanner } from 'modules/affiliate/pure/TraderReferralCodeNetworkBanner'
import { PageTitle } from 'modules/application/containers/PageTitle'

const MIN_LOADING_MS = 200

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function, complexity
export default function AccountMyRewards() {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const toggleWalletModal = useToggleWalletModal()
  const traderReferralCode = useTraderReferralCode()
  const traderReferralCodeActions = useTraderReferralCodeActions()
  const [traderStats, setTraderStats] = useState<TraderStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const isConnected = Boolean(account)
  const supportedNetwork = chainId === undefined ? true : isSupportedReferralNetwork(chainId)
  const isUnsupportedNetwork = Boolean(account) && !supportedNetwork
  const incomingIneligibleCode = getIncomingIneligibleCode(
    traderReferralCode.incomingCode,
    traderReferralCode.verification,
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), [])
  const formatNumber = useCallback(
    (value: number | null | undefined) => (value === null || value === undefined ? '-' : numberFormatter.format(value)),
    [numberFormatter],
  )

  useEffect(() => {
    let cancelled = false

    if (!account) {
      setTraderStats(null)
      setLoading(false)
      return
    }

    const loadStats = async (): Promise<void> => {
      setLoading(true)
      try {
        const [stats] = await Promise.all([bffAffiliateApi.getTraderStats(account), delay(MIN_LOADING_MS)])
        if (cancelled) {
          return
        }

        setTraderStats(stats)
        if (stats?.bound_referrer_code && traderReferralCode.savedCode !== stats.bound_referrer_code) {
          traderReferralCodeActions.setSavedCode(stats.bound_referrer_code)
          traderReferralCodeActions.setWalletState({ status: 'linked', code: stats.bound_referrer_code })
        }
      } catch {
        if (cancelled) {
          return
        }
        setTraderStats(null)
      }

      setLoading(false)
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [account, traderReferralCode.savedCode, traderReferralCodeActions])

  const statsReady = Boolean(traderStats)
  const statsLinkedCode = traderStats?.bound_referrer_code
  const isLinked = Boolean(statsLinkedCode) || traderReferralCode.wallet.status === 'linked'
  const isIneligible = traderReferralCode.wallet.status === 'ineligible' && isConnected && !statsLinkedCode
  const programParams =
    traderReferralCode.verification.kind === 'valid'
      ? traderReferralCode.verification.programParams
      : traderReferralCode.previousVerification?.kind === 'valid'
        ? traderReferralCode.previousVerification.programParams
        : undefined
  const rewardAmountLabel = programParams ? formatUsdCompact(programParams?.traderRewardAmount) : 'reward'
  const linkedWalletCode = traderReferralCode.wallet.status === 'linked' ? traderReferralCode.wallet.code : undefined
  const traderCode = isConnected
    ? (statsLinkedCode ??
      linkedWalletCode ??
      traderReferralCode.savedCode ??
      (traderReferralCode.verification.kind === 'valid' ? traderReferralCode.verification.code : undefined))
    : undefined
  const traderHasCode = Boolean(traderCode)
  const triggerVolume = typeof programParams?.triggerVolumeUsd === 'number' ? programParams.triggerVolumeUsd : null
  const leftToNextRewards = statsReady ? traderStats?.left_to_next_rewards : undefined
  const progressToNextReward =
    triggerVolume !== null && leftToNextRewards !== undefined ? Math.max(triggerVolume - leftToNextRewards, 0) : 0
  const rewardsProgressPercent = triggerVolume
    ? Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
    : 0
  const rewardsProgressLabel = triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0)
  const hasTriggerVolume = triggerVolume !== null
  const triggerVolumeLabel = hasTriggerVolume ? formatUsdCompact(triggerVolume) : formatUsdCompact(0)
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
  const approxStatsUpdatedAt = useMemo((): Date => {
    const intervalMs = AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS * 60 * 60 * 1000
    const lagMs = AFFILIATE_REWARDS_UPDATE_LAG_HOURS * 60 * 60 * 1000
    // eslint-disable-next-line react-hooks/purity
    const approximateUpdatedAtMs = Math.floor((Date.now() - lagMs) / intervalMs) * intervalMs + lagMs
    return new Date(approximateUpdatedAtMs)
  }, [])
  const statsUpdatedLabel = useTimeAgo(approxStatsUpdatedAt, 60_000)
  const statsUpdatedDisplay = statsUpdatedLabel ? ` ≈ ${statsUpdatedLabel}` : '-'
  const statsUpdatedText = i18n._(t`Last updated`)
  const statsUpdatedTooltip = i18n._(
    t`Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.`,
  )
  const statsUpdatedAbsoluteLabel = formatDateWithTimezone(approxStatsUpdatedAt)
  const statsUpdatedTitle = statsUpdatedAbsoluteLabel ?? undefined

  const handleOpenRewardsModal = useCallback(() => {
    traderReferralCodeActions.openModal('rewards')
  }, [traderReferralCodeActions])

  const handleConnect = useCallback(() => {
    toggleWalletModal()
  }, [toggleWalletModal])

  const supportedNetworks = AFFILIATE_SUPPORTED_NETWORK_NAMES.join(', ')

  return (
    <>
      <TraderReferralCodeNetworkBanner forceVisible onlyWhenUnsupported />
      <RewardsWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {isIneligible ? (
          <IneligibleCard>
            <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />

            <IneligibleTitle>
              <Trans>Your wallet is ineligible</Trans>
            </IneligibleTitle>
            <IneligibleSubtitle>
              <TraderReferralCodeIneligibleCopy incomingCode={incomingIneligibleCode} />
            </IneligibleSubtitle>
          </IneligibleCard>
        ) : isUnsupportedNetwork ? (
          <UnsupportedNetworkCard>
            <UnsupportedNetworkHeader>
              <AlertCircle size={20} />
              <Trans>Switch network</Trans>
            </UnsupportedNetworkHeader>
            <UnsupportedNetworkMessage>
              <Trans>Please connect your wallet to one of our supported networks: {supportedNetworks}.</Trans>
            </UnsupportedNetworkMessage>
          </UnsupportedNetworkCard>
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
              <AffiliateTermsFaqLinks />
            </HeroContent>
          </HeroCard>
        ) : (
          <>
            <RewardsThreeColumnGrid>
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
                    <ButtonPrimary onClick={handleOpenRewardsModal}>
                      <Trans>Edit code</Trans>
                    </ButtonPrimary>
                  </HeroActions>
                )}
              </RewardsCol1Card>

              <RewardsCol2Card showLoader={loading}>
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
                        <Trans>Received</Trans>
                      </span>
                      <strong>{claimedLabel}</strong>
                    </MetricItem>
                  </RewardsMetricsList>
                  <Donut $value={rewardsProgressPercent}>
                    <DonutValue>
                      <span>{rewardsProgressLabel}</span>
                      {hasTriggerVolume && (
                        <small>
                          <Trans>of</Trans> {triggerVolumeLabel}
                        </small>
                      )}
                    </DonutValue>
                  </Donut>
                </RewardsMetricsRow>
                <BottomMetaRow>
                  <LabelContent>
                    <span>
                      {statsUpdatedText}
                      <span title={statsUpdatedTitle}>{statsUpdatedDisplay}</span>
                    </span>
                    <HelpTooltip text={statsUpdatedTooltip} />
                  </LabelContent>
                </BottomMetaRow>
              </RewardsCol2Card>

              <NextPayoutCard payoutLabel={nextPayoutLabel} showLoader={loading} />
            </RewardsThreeColumnGrid>
          </>
        )}
      </RewardsWrapper>
    </>
  )
}
