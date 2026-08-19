import { ReactNode } from 'react'

import svgEarnAsTraderSrc from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, Modal } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { CodeLinkingSubtitle } from '../pure/AffiliateTraderModal/CodeLinkingSubtitle'
import { HeroIllustration, Title } from '../pure/AffiliateTraderModal/styles'

export function AffiliateTraderModalUnsupported(): ReactNode {
  return (
    <>
      <Modal.Content>
        <HeroIllustration src={svgEarnAsTraderSrc} alt="" role="presentation" />
        <Title>
          <Trans>You&apos;ve been referred - here&apos;s your reward</Trans>
        </Title>
        <CodeLinkingSubtitle />
      </Modal.Content>
      <Modal.Footer>
        <ButtonPrimary disabled type="button">
          <Trans>Unsupported Network</Trans>
        </ButtonPrimary>
      </Modal.Footer>
    </>
  )
}
