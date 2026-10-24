import { ReactNode } from 'react'

import { ProductLogo, ProductVariant, TooltipIcon } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './CowParticipationFooter.styled'

export interface CowParticipationFooterProps {
  variant?: CowParticipationVariant
  tooltip?: ReactNode
}

export type CowParticipationVariant = 'cow' | 'unconfirmed' | 'unavailable'

export function CowParticipationFooter({ variant = 'cow', tooltip }: CowParticipationFooterProps): ReactNode {
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
      <styledEl.CowParticipationLabel>{participationLabel(variant)}</styledEl.CowParticipationLabel>
      <TooltipIcon type="info" title={participationTitle(variant)} content={tooltip ?? participationTooltip(variant)} />
    </styledEl.CowParticipation>
  )
}

function participationLabel(variant: CowParticipationVariant): ReactNode {
  if (variant === 'unconfirmed') return <Trans>Matching unconfirmed</Trans>
  if (variant === 'unavailable') return <Trans>Matching details unavailable</Trans>
  return <Trans>You were part of a CoW</Trans>
}

function participationTitle(variant: CowParticipationVariant): string {
  if (variant === 'unconfirmed') return t`Matching unconfirmed`
  if (variant === 'unavailable') return t`Matching details unavailable`
  return t`You were part of a CoW`
}

function participationTooltip(variant: CowParticipationVariant): string {
  if (variant === 'unconfirmed') {
    return t`We couldn't confirm whether this order was matched with another trader in the same auction.`
  }
  if (variant === 'unavailable') {
    return t`Auction details aren't available, so we can't tell whether this order was part of a CoW.`
  }
  return t`Your trade was matched with other orders in a Coincidence of Wants (CoW).`
}
