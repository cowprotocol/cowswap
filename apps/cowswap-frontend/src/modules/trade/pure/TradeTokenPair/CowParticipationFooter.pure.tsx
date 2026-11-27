import { ReactNode } from 'react'

import { ProductLogo, ProductVariant, TooltipIcon } from '@cowprotocol/ui'

import { plural, t } from '@lingui/core/macro'

import * as styledEl from './CowParticipationFooter.styled'

export interface CowParticipationFooterProps {
  kind: CowParticipationKind
  companionCount?: number
  hasAloneBid?: boolean
  comparisonUnavailable?: boolean
}

export type CowParticipationKind = 'cow' | 'batched' | 'joined'

export function CowParticipationFooter({
  kind,
  companionCount = 0,
  hasAloneBid = false,
  comparisonUnavailable = false,
}: CowParticipationFooterProps): ReactNode {
  const label = getCowParticipationLabel(kind, companionCount)
  const tooltip = getCowParticipationTooltip(kind, hasAloneBid, comparisonUnavailable)

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
      <styledEl.CowParticipationLabel>{label}</styledEl.CowParticipationLabel>
      <TooltipIcon type="info" title={label} content={tooltip} />
    </styledEl.CowParticipation>
  )
}

function getCowParticipationLabel(kind: CowParticipationKind, companionCount: number): string {
  if (kind === 'batched') {
    return plural(companionCount, {
      one: 'Wait & save · Batched with # other',
      few: 'Wait & save · Batched with # others',
      many: 'Wait & save · Batched with # others',
      other: 'Wait & save · Batched with # others',
    })
  }

  if (kind === 'joined') return t`Wait & save · Joined the batch`

  return t`You were part of a CoW`
}

function getCowParticipationTooltip(
  kind: CowParticipationKind,
  hasAloneBid: boolean,
  comparisonUnavailable: boolean,
): string {
  if (kind === 'cow') {
    return t`Your order was part of a Coincidence of Wants (CoW): solvers combined it with other traders’ orders in the same batch, and you got more than trading alone.`
  }

  if (comparisonUnavailable) return t`There’s no separate gain to show.`

  if (kind === 'batched') {
    return hasAloneBid
      ? t`Solvers included your order in a batch with other orders. There’s no separate gain to show.`
      : t`Solvers included your order in a batch with other orders. There was no offer for your order alone to compare, so there’s no separate gain to show.`
  }

  return hasAloneBid
    ? t`The winning solution contained only your order. There’s no separate gain to show.`
    : t`The winning solution contained only your order. There was no offer for your order alone to compare, so there’s no separate gain to show.`
}
