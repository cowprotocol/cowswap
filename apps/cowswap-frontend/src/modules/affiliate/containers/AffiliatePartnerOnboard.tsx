import { ReactNode, useCallback } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { useWalletClient } from 'wagmi'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

import { AFFILIATE_PAYOUTS_CHAIN_ID, AFFILIATE_TERMS_URL, PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import {
  formatUsdCompact,
  getDefaultTriggerVolume,
  getPartnerRewardAmountLabel,
  isSupportedPayoutsNetwork,
  isSupportedTradingNetwork,
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

export function AffiliatePartnerOnboard(): ReactNode {
  const { data: walletClient } = useWalletClient()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const { walletName } = useWalletDetails()
  const onSelectNetwork = useOnSelectNetwork()
  const toggleWalletModal = useToggleWalletModal()

  const shouldHideNetworkSelector = useShouldHideNetworkSelector()
  const onPayoutsChain = isSupportedPayoutsNetwork(chainId)
  const isAffiliateSupportedNetwork = isSupportedTradingNetwork(chainId)
  const shouldSwitchToPayoutsChain = !!account && !onPayoutsChain
  const shouldUseFullWidthCard = !!account && isAffiliateSupportedNetwork
  const isSignerAvailable = Boolean(walletClient)
  const partnerRewardAmount = getPartnerRewardAmountLabel()
  const triggerVolumeLabel = formatUsdCompact(getDefaultTriggerVolume())
  const affiliateTimeCapDays = PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  const onSwitchToMainnet = useCallback(() => {
    onSelectNetwork(AFFILIATE_PAYOUTS_CHAIN_ID)
  }, [onSelectNetwork])

  return (
    <HeroCard $fullWidth={shouldUseFullWidthCard}>
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
        <HeroActions>
          {!account && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} data-testid="affiliate-connect" onClick={toggleWalletModal}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
          {shouldSwitchToPayoutsChain && !shouldHideNetworkSelector && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} width={'320px'} onClick={onSwitchToMainnet}>
              <Trans>Switch to Ethereum</Trans>
            </ButtonPrimary>
          )}
          {shouldSwitchToPayoutsChain && shouldHideNetworkSelector && (
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
          {!!account && onPayoutsChain && !isSignerAvailable && (
            <ButtonPrimary onClick={toggleWalletModal} data-testid="affiliate-unlock">
              <Trans>Become an affiliate</Trans>
            </ButtonPrimary>
          )}
          <HowItWorks />
        </HeroActions>
        <InlineNote>
          <Trans>Affiliate payouts and registration happen on Ethereum mainnet.</Trans>{' '}
          <AffiliateInlineLink href={AFFILIATE_TERMS_URL} target="_blank" rel="noopener noreferrer">
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
