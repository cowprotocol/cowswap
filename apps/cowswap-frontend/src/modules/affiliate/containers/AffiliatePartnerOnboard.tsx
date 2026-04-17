import { ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { useWalletClient } from 'wagmi'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { AFFILIATE_PAYOUTS_CHAIN_ID, AFFILIATE_TERMS_URL, PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import {
  formatUsdCompact,
  getDefaultTriggerVolume,
  getPartnerRewardAmountLabel,
  isSupportedPayoutsNetwork,
} from '../lib/affiliateProgramUtils'
import { HowItWorks } from '../pure/HowItWorks'
import {
  AffiliateInlineLink,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InlineNote,
} from '../pure/shared'

interface PartnerOnboardActionsProps {
  account: string | undefined
  isSignerAvailable: boolean
  isUnsupportedNetwork: boolean
  onBecomeAffiliate(): void
  onConnectWallet(): void
  onHowItWorksClick(): void
  onSwitchToMainnet(): void
  shouldHideNetworkSelector: boolean
  walletName: string | undefined
}

function PartnerOnboardActions({
  account,
  isSignerAvailable,
  isUnsupportedNetwork,
  onBecomeAffiliate,
  onConnectWallet,
  onHowItWorksClick,
  onSwitchToMainnet,
  shouldHideNetworkSelector,
  walletName,
}: PartnerOnboardActionsProps): ReactNode {
  return (
    <HeroActions>
      {!account && (
        <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnectWallet} data-testid="affiliate-connect">
          <Trans>Connect wallet</Trans>
        </ButtonPrimary>
      )}
      {!!account && isUnsupportedNetwork && !shouldHideNetworkSelector && (
        <ButtonPrimary buttonSize={ButtonSize.BIG} width="320px" onClick={onSwitchToMainnet}>
          <Trans>Switch to Ethereum</Trans>
        </ButtonPrimary>
      )}
      {!!account && isUnsupportedNetwork && shouldHideNetworkSelector && (
        <WalletSwitchHint>
          <ButtonPrimary buttonSize={ButtonSize.BIG} disabled>
            <Trans>Switch to Ethereum</Trans>
          </ButtonPrimary>
          <InlineNote>
            {walletName ? (
              <Trans>To proceed, change the network in your {walletName}</Trans>
            ) : (
              <Trans>To proceed, change the network in your wallet</Trans>
            )}
          </InlineNote>
        </WalletSwitchHint>
      )}
      {!!account && !isUnsupportedNetwork && !isSignerAvailable && (
        <ButtonPrimary onClick={onBecomeAffiliate} data-testid="affiliate-unlock">
          <Trans>Become an affiliate</Trans>
        </ButtonPrimary>
      )}
      <HowItWorks onClick={onHowItWorksClick} />
    </HeroActions>
  )
}

export function AffiliatePartnerOnboard(): ReactNode {
  const analytics = useCowAnalytics()
  const { data: walletClient } = useWalletClient()
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const onSelectNetwork = useOnSelectNetwork()
  const toggleWalletModal = useToggleWalletModal()

  const shouldHideNetworkSelector = useShouldHideNetworkSelector()
  const isUnsupportedNetwork = !isSupportedPayoutsNetwork(chainId)
  const isSignerAvailable = Boolean(walletClient)
  const partnerRewardAmount = getPartnerRewardAmountLabel()
  const triggerVolumeLabel = formatUsdCompact(getDefaultTriggerVolume())
  const affiliateTimeCapDays = PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  const trackOnboardClick = useCallback(
    (ctaType: 'connectWallet' | 'switchToEthereum' | 'becomeAffiliate'): void => {
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_partner_onboard_cta_clicked',
        ctaType,
        hasAccount: !!account,
        isUnsupportedNetwork,
        isSignerAvailable,
      })
    },
    [account, analytics, isSignerAvailable, isUnsupportedNetwork],
  )
  const onConnectWallet = useCallback((): void => {
    trackOnboardClick('connectWallet')
    toggleWalletModal()
  }, [toggleWalletModal, trackOnboardClick])
  const onSwitchToMainnet = useCallback((): void => {
    trackOnboardClick('switchToEthereum')
    onSelectNetwork(AFFILIATE_PAYOUTS_CHAIN_ID)
  }, [onSelectNetwork, trackOnboardClick])
  const onBecomeAffiliate = useCallback((): void => {
    trackOnboardClick('becomeAffiliate')
    toggleWalletModal()
  }, [toggleWalletModal, trackOnboardClick])
  const onTermsClick = useCallback(
    (): void =>
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_partner_terms_clicked',
        entrySource: AffiliateEntrySource.PARTNER_PAGE_ONBOARD,
      }),
    [analytics],
  )
  const onHowItWorksClick = useCallback(
    (): void =>
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_partner_how_it_works_clicked',
        entrySource: AffiliateEntrySource.PARTNER_PAGE_ONBOARD,
      }),
    [analytics],
  )

  return (
    <HeroCard>
      <HeroContent>
        <img src={EARN_AS_AFFILIATE_ILLUSTRATION} alt="" role="presentation" />
        <HeroTitle $maxWidth={400}>
          <Trans>Invite your friends. Earn together.</Trans>
        </HeroTitle>
        <HeroSubtitle $maxWidth={400}>
          <Trans>
            Share your referral code and earn <strong>{partnerRewardAmount}</strong> for every{' '}
            <strong>{triggerVolumeLabel}</strong> in eligible volume within {affiliateTimeCapDays} days.
          </Trans>
        </HeroSubtitle>
        <PartnerOnboardActions
          account={account}
          isSignerAvailable={isSignerAvailable}
          isUnsupportedNetwork={isUnsupportedNetwork}
          onBecomeAffiliate={onBecomeAffiliate}
          onConnectWallet={onConnectWallet}
          onHowItWorksClick={onHowItWorksClick}
          onSwitchToMainnet={onSwitchToMainnet}
          shouldHideNetworkSelector={shouldHideNetworkSelector}
          walletName={walletName}
        />
        <InlineNote>
          <Trans>Affiliate payouts and registration happen on Ethereum mainnet.</Trans>{' '}
          <AffiliateInlineLink
            href={AFFILIATE_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClickOptional={onTermsClick}
          >
            <Trans>See Terms</Trans>
          </AffiliateInlineLink>
        </InlineNote>
      </HeroContent>
    </HeroCard>
  )
}

const WalletSwitchHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`
