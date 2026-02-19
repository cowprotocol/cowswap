import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { HowItWorks } from 'modules/affiliate/pure/HowItWorks'

import { Body, Footer, Subtitle, Title } from '../pure/AffiliateTraderModal/styles'

export function AffiliateTraderModalUnsupported(): ReactNode {
  const { account } = useWalletInfo()

  return (
    <>
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Enter referral code</Trans>
        </Title>
        <Subtitle>
          {!!account ? (
            <Trans>
              Code binds on your first eligible trade. Earn rewards for eligible volume within the program window.
              Payouts happen on Ethereum mainnet.
            </Trans>
          ) : (
            <Trans>
              Connect to verify eligibility. Code binds on your first eligible trade. Earn rewards for eligible volume
              within the program window. Payouts happen on Ethereum mainnet.
            </Trans>
          )}{' '}
          <HowItWorks />
        </Subtitle>
      </Body>
      <Footer>
        <ButtonPrimary disabled type="button">
          <Trans>Unsupported Network</Trans>
        </ButtonPrimary>
      </Footer>
    </>
  )
}
