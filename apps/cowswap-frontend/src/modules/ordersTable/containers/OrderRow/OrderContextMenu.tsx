import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ContextMenuTooltip, ContextMenuItemButton, ContextMenuExternalLink } from '@cowprotocol/ui'

import { Edit, FileText, MoreVertical, Repeat, Trash2 } from 'react-feather'

import { AlternativeOrderModalContext } from '../../types'

export interface OrderContextMenuProps {
  openReceipt: Command
  activityUrl: string | undefined
  showCancellationModal: Command | null
  alternativeOrderModalContext: AlternativeOrderModalContext
}

export function OrderContextMenu({
  openReceipt,
  activityUrl,
  showCancellationModal,
  alternativeOrderModalContext,
}: OrderContextMenuProps): ReactNode {
  return (
    <ContextMenuTooltip
      disableHoverBackground
      content={
        <>
          <ContextMenuItemButton onClick={openReceipt}>
            <FileText size={16} />
            <span>Order receipt</span>
          </ContextMenuItemButton>
          {activityUrl && <ContextMenuExternalLink href={activityUrl} label="View on explorer" />}
          {alternativeOrderModalContext && (
            <ContextMenuItemButton onClick={alternativeOrderModalContext.showAlternativeOrderModal}>
              {alternativeOrderModalContext.isEdit ? <Edit size={16} /> : <Repeat size={16} />}
              <span>{alternativeOrderModalContext.isEdit ? 'Edit' : 'Recreate'} order</span>
            </ContextMenuItemButton>
          )}
          {showCancellationModal && (
            <ContextMenuItemButton variant="danger" onClick={showCancellationModal}>
              <Trash2 size={16} />
              <span>Cancel order</span>
            </ContextMenuItemButton>
          )}
        </>
      }
    >
      <MoreVertical />
    </ContextMenuTooltip>
  )
}
