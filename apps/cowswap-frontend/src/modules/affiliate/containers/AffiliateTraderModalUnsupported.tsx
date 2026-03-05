import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Body, Title, Footer } from '../pure/AffiliateTraderModal/AffiliateTraderModal.shared'
import { CodeLinkingSubtitle } from '../pure/AffiliateTraderModal/CodeLinkingSubtitle'

export function AffiliateTraderModalUnsupported(): ReactNode {
  return (
    <>
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Earn while you trade</Trans>
        </Title>
        <CodeLinkingSubtitle />
      </Body>
      <Footer>
        <ButtonPrimary disabled type="button">
          <Trans>Unsupported Network</Trans>
        </ButtonPrimary>
      </Footer>
    </>
  )
}
