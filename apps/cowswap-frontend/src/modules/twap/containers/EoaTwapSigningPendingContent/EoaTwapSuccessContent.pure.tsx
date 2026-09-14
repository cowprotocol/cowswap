import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Check } from 'react-feather'

import * as styledEl from './EoaTwapSuccessContent.styled'

export interface EoaTwapSuccessContentProps {
  explorerUrl?: string
  onNewTrade(): void
  onViewOrders(): void
}

export function EoaTwapSuccessContent({
  explorerUrl,
  onNewTrade,
  onViewOrders,
}: EoaTwapSuccessContentProps): ReactNode {
  return (
    <>
      <styledEl.SuccessBox>
        <styledEl.IconWrap>
          <Check size={18} strokeWidth={3} aria-hidden />
        </styledEl.IconWrap>
        <styledEl.Title>
          <Trans>Your TWAP is active</Trans>
        </styledEl.Title>
        <styledEl.Subtitle>
          <Trans>Track its progress in Orders.</Trans>
        </styledEl.Subtitle>
        {explorerUrl ? (
          <styledEl.ExplorerAnchor href={explorerUrl}>{t`Open in CoW Explorer`} ↗</styledEl.ExplorerAnchor>
        ) : null}
      </styledEl.SuccessBox>
      <styledEl.Actions>
        <styledEl.NewTradeButton type="button" onClick={onNewTrade}>
          <Trans>New trade</Trans>
        </styledEl.NewTradeButton>
        <styledEl.ViewOrdersButton type="button" onClick={onViewOrders}>
          <Trans>View in Orders</Trans>
        </styledEl.ViewOrdersButton>
      </styledEl.Actions>
    </>
  )
}
