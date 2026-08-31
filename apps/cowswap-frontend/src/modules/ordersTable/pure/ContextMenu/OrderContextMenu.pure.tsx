import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ContextMenuTooltip, ContextMenuItemButton, ContextMenuExternalLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit, FileText, MoreVertical, Repeat, Trash2 } from 'react-feather'

import { AlternativeOrderModalContext } from '../../state/ordersTable.types'

export interface OrderContextMenuProps {
  openReceipt?: Command
  activityUrl: string | undefined
  showCancellationModal: Command | null
  alternativeOrderModalContext?: AlternativeOrderModalContext
  ariaLabel?: string
  triggerSize?: number
}

export function OrderContextMenu({
  openReceipt,
  activityUrl,
  showCancellationModal,
  alternativeOrderModalContext,
  ariaLabel,
  triggerSize,
}: OrderContextMenuProps): ReactNode {
  return (
    <ContextMenuTooltip
      ariaLabel={ariaLabel}
      disableHoverBackground
      triggerSize={triggerSize}
      content={
        <>
          {openReceipt ? (
            <ContextMenuItemButton onClick={openReceipt}>
              <FileText size={16} />
              <span>
                <Trans>Order receipt</Trans>
              </span>
            </ContextMenuItemButton>
          ) : null}
          {activityUrl && <ContextMenuExternalLink href={activityUrl} label={t`View on explorer`} />}
          {alternativeOrderModalContext && (
            <ContextMenuItemButton onClick={alternativeOrderModalContext.showAlternativeOrderModal}>
              {alternativeOrderModalContext.isEdit ? <Edit size={16} /> : <Repeat size={16} />}
              <span>
                {alternativeOrderModalContext.isEdit ? t`Edit` : t`Recreate`} <Trans>order</Trans>
              </span>
            </ContextMenuItemButton>
          )}
          {showCancellationModal && (
            <ContextMenuItemButton variant="danger" onClick={showCancellationModal}>
              <Trash2 size={16} />
              <span>
                <Trans>Cancel order</Trans>
              </span>
            </ContextMenuItemButton>
          )}
        </>
      }
    >
      <MoreVertical />
    </ContextMenuTooltip>
  )
}
