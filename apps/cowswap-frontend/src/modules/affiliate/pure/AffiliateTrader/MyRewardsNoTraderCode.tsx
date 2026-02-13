import { ReactElement } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import {
  AffiliateTermsFaqLinks,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
} from 'modules/affiliate/pure/shared'

interface MyRewardsNoTraderCodeProps {
  isConnected: boolean
  onConnect: () => void
  onAddCode: () => void
}

export function MyRewardsNoTraderCode({ isConnected, onConnect, onAddCode }: MyRewardsNoTraderCodeProps): ReactElement {
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
          {!isConnected ? (
            <ButtonPrimary onClick={onConnect}>
              <Trans>Connect wallet</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={onAddCode}>
              <Trans>Add code</Trans>
            </ButtonPrimary>
          )}
        </HeroActions>
        <AffiliateTermsFaqLinks />
      </HeroContent>
    </HeroCard>
  )
}
