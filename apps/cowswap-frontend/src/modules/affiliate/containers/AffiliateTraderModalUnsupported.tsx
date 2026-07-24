import { ReactNode } from 'react'

import svgEarnAsTraderSrc from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { CodeLinkingSubtitle } from '../pure/AffiliateTraderModal/CodeLinkingSubtitle'
import { Body, Footer, Title } from '../pure/AffiliateTraderModal/styles'

export function AffiliateTraderModalUnsupported(): ReactNode {
  return (
    <>
      <Body>
        <img src={svgEarnAsTraderSrc} alt="" role="presentation" />
        <Title>
          <Trans>You&apos;ve been referred - here&apos;s your reward</Trans>
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
