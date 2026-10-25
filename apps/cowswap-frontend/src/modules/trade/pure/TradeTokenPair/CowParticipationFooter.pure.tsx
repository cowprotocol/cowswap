import { ReactNode } from 'react'

import { ProductLogo, ProductVariant, TooltipIcon } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './CowParticipationFooter.styled'

export interface CowParticipationFooterProps {
  tooltip: ReactNode
}

export function CowParticipationFooter({ tooltip }: CowParticipationFooterProps): ReactNode {
  return (
    <styledEl.CowParticipation>
      <styledEl.CowMark>
        <ProductLogo
          variant={ProductVariant.CowSwap}
          logoIconOnly
          height={12}
          heightMobile={12}
          overrideColor="inherit"
        />
      </styledEl.CowMark>
      <styledEl.CowParticipationLabel>
        <Trans>Wait & Save</Trans>
      </styledEl.CowParticipationLabel>
      <TooltipIcon type="info" title={t`Wait & Save`} content={tooltip} />
    </styledEl.CowParticipation>
  )
}
