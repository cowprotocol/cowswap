import { ReactElement, useCallback } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

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

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

export function AffiliatePartnerOnboard(): ReactElement {
  const provider = useWalletProvider()
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const onSelectNetwork = useOnSelectNetwork()
  const shouldHideNetworkSelector = useShouldHideNetworkSelector()
  const toggleWalletModal = useToggleWalletModal()

  const isUnsupported = !!account && chainId !== SupportedChainId.MAINNET
  const isSignerAvailable = Boolean(provider)

  const onSwitchToMainnet = useCallback(() => {
    onSelectNetwork(SupportedChainId.MAINNET)
  }, [onSelectNetwork])

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
          {!account && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={toggleWalletModal} data-testid="affiliate-connect">
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
          {!!account && isUnsupported && !shouldHideNetworkSelector && (
            <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onSwitchToMainnet}>
              <Trans>Switch to Ethereum</Trans>
            </ButtonPrimary>
          )}
          {!!account && isUnsupported && shouldHideNetworkSelector && (
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
          {!!account && !isUnsupported && !isSignerAvailable && (
            <ButtonPrimary onClick={toggleWalletModal} data-testid="affiliate-unlock">
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
