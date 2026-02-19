import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { AffiliateTermsFaqLinks, HeroActions, HeroCard, HeroContent, HeroSubtitle, HeroTitle } from '../pure/shared'

export function AffiliateTraderOnboard(): ReactNode {
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const toggleAffiliateModal = useToggleAffiliateModal()

  return (
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
            <br />
            New wallets only.
          </Trans>
        </HeroSubtitle>
        <HeroActions>
          {account ? (
            <ButtonPrimary onClick={toggleAffiliateModal}>
              <Trans>Add code</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={toggleWalletModal}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          )}
        </HeroActions>
        <AffiliateTermsFaqLinks />
      </HeroContent>
    </HeroCard>
  )
}
