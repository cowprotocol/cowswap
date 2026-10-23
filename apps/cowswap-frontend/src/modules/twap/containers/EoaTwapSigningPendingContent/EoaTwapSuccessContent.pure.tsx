import { ReactNode } from 'react'

import { Modal } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { BaseTradeConfirmation } from 'modules/trade'

import * as styledEl from './EoaTwapSuccessContent.styled'

export interface EoaTwapSuccessContentProps {
  explorerUrl?: string
  onViewOrders(): void | Promise<void>
}

export function EoaTwapSuccessContent({ explorerUrl, onViewOrders }: EoaTwapSuccessContentProps): ReactNode {
  return (
    <>
      {explorerUrl ? (
        <styledEl.ExplorerAnchor href={explorerUrl}>{t`Open in CoW Explorer`} ↗</styledEl.ExplorerAnchor>
      ) : null}

      <Modal.FooterWithTwoButtons
        inline
        secondaryButton={{ label: <Trans>View in Orders</Trans>, onClick: onViewOrders }}
      />
    </>
  )
}

export function EoaTwapSuccessHeading(): ReactNode {
  return (
    <BaseTradeConfirmation
      heading={{
        title: <Trans>Your TWAP is active</Trans>,
        subtitle: <Trans>Track its progress in Orders.</Trans>,
      }}
    />
  )
}
