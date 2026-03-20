import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import {
  ContextMenuTooltip,
  ContextMenuItemButton,
  ContextMenuExternalLink,
  ContextMenuItemText,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit, FileText, MoreVertical, Pocket, Repeat, Trash2 } from 'react-feather'

import { AlternativeOrderModalContext } from '../../state/ordersTable.types'

export interface OrderContextMenuProps {
  openReceipt: Command
  activityUrl: string | undefined
  showCancellationModal: Command | null
  alternativeOrderModalContext?: AlternativeOrderModalContext
  openProxyAccount?: Command | null
  isPrototype?: boolean
}

export function OrderContextMenu({
  openReceipt,
  activityUrl,
  showCancellationModal,
  alternativeOrderModalContext,
  openProxyAccount,
  isPrototype,
}: OrderContextMenuProps): ReactNode {
  return (
    <ContextMenuTooltip
      disableHoverBackground
      content={
        <>
          {isPrototype && <ContextMenuItemText>{t`Prototype order (local only)`}</ContextMenuItemText>}
          <ContextMenuItemButton onClick={openReceipt}>
            <FileText size={16} />
            <span>
              <Trans>Order receipt</Trans>
            </span>
          </ContextMenuItemButton>
          {openProxyAccount && (
            <ContextMenuItemButton onClick={openProxyAccount}>
              <Pocket size={16} />
              <span>
                <Trans>View TWAP proxy account</Trans>
              </span>
            </ContextMenuItemButton>
          )}
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
