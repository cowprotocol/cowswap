import { ReactNode } from 'react'

import { Modal } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Check } from 'react-feather'

import * as styledEl from './EoaTwapSuccessContent.styled'

export interface EoaTwapSuccessContentProps {
  explorerUrl?: string
  onNewTrade(): void
  onViewOrders(): void | Promise<void>
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

      <Modal.FooterWithTwoButtons
        inline
        secondaryButton={{ label: <Trans>New trade</Trans>, onClick: onNewTrade }}
        primaryButton={{ label: <Trans>View in Orders</Trans>, onClick: onViewOrders }}
      />
    </>
  )
}
