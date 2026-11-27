import { ReactNode } from 'react'

import { Modal } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { BaseTradeConfirmation } from 'modules/trade'

import * as styledEl from './EoaTwapSuccessContent.styled'

export interface EoaTwapSuccessContentProps {
  explorerUrl?: string
  onDismiss(): void
  onViewOrders?: () => void | Promise<void>
}

export interface EoaTwapSuccessHeadingProps {
  hasOrdersTable: boolean
}

export function EoaTwapSuccessContent({ explorerUrl, onDismiss, onViewOrders }: EoaTwapSuccessContentProps): ReactNode {
  return (
    <>
      {explorerUrl ? (
        <styledEl.ExplorerAnchor href={explorerUrl}>{t`Open in CoW Explorer`} ↗</styledEl.ExplorerAnchor>
      ) : null}

      <Modal.FooterWithTwoButtons
        inline
        secondaryButton={
          onViewOrders
            ? { label: <Trans>View in Orders</Trans>, onClick: onViewOrders }
            : { label: <Trans>Close</Trans>, onClick: onDismiss }
        }
      />
    </>
  )
}

export function EoaTwapSuccessHeading({ hasOrdersTable }: EoaTwapSuccessHeadingProps): ReactNode {
  return (
    <BaseTradeConfirmation
      heading={{
        title: <Trans>Your TWAP is active</Trans>,
        subtitle: hasOrdersTable ? <Trans>Track its progress in Orders.</Trans> : undefined,
      }}
    />
  )
}
