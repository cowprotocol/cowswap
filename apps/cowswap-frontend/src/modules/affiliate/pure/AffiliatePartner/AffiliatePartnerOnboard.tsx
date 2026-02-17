import { ReactElement } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { HowItWorks } from 'modules/affiliate/pure/HowItWorks'
import {
  AffiliateTermsFaqLinks,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InlineNote,
} from 'modules/affiliate/pure/shared'

interface AffiliatePartnerOnboardProps {
  isConnected: boolean
  isUnsupported: boolean
  shouldHideNetworkSelector: boolean
  isSignerAvailable: boolean
  walletName: string | undefined
  onConnect: () => void
  onSwitchToMainnet: () => void
}

export function AffiliatePartnerOnboard({
  isConnected,
  isUnsupported,
  shouldHideNetworkSelector,
  isSignerAvailable,
  walletName,
  onConnect,
  onSwitchToMainnet,
}: AffiliatePartnerOnboardProps): ReactElement {
  return (
    <HeroCard>
      <HeroContent>
        <img src={EARN_AS_AFFILIATE_ILLUSTRATION} alt="" role="presentation" />
        <HeroTitle>
          <Trans>
            Invite your friends <br /> and earn rewards
          </Trans>
        </HeroTitle>
        <HeroSubtitle>
          <Trans>
            You and your referrals can earn a flat fee <br /> for the eligible volume done through the app.{' '}
            <HowItWorks />
          </Trans>
        </HeroSubtitle>
        <HeroActions>
          {!isConnected && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect} data-testid="affiliate-connect">
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
          {isConnected && isUnsupported && !shouldHideNetworkSelector && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onSwitchToMainnet}>
              <Trans>Switch to Ethereum</Trans>
            </ButtonPrimary>
          )}
          {isConnected && isUnsupported && shouldHideNetworkSelector && (
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
          {isConnected && !isUnsupported && !isSignerAvailable && (
            <ButtonPrimary onClick={onConnect} data-testid="affiliate-unlock">
              <Trans>Become an affiliate</Trans>
            </ButtonPrimary>
          )}
        </HeroActions>
        <AffiliateTermsFaqLinks />
        {isUnsupported && (
          <InlineNote>
            <Trans>Affiliate payouts and registration happen on Ethereum mainnet.</Trans>
          </InlineNote>
        )}
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
