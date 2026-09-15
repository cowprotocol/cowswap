import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { Media } from '../../consts'
import { BottomDrawer } from '../BottomDrawer/BottomDrawer.pure'
import { BottomDrawerOrDialog } from '../BottomDrawer/BottomDrawerOrDialog'
import { Dialog } from '../Dialog/Dialog.pure'
import { Modal } from '../Modal/Modal.pure'
import { ModalHeader } from '../ModalHeader'

export interface ConfirmBottomDrawerOrDialogProps {
  isOpen: boolean
  title: ReactNode
  description?: ReactNode
  content: ReactNode
  cancelLabel: ReactNode
  onCancel(): void
  confirmLabel: ReactNode
  onConfirm(): void
  confirmDisabled?: boolean
  /** Adds a top border matching the scrolled modal header and 10px top padding. */
  footerTopBorder?: boolean
  /** Called when the overlay is dismissed (e.g. swipe down, click outside). Defaults to `onCancel`. */
  onDismiss?(): void
}

export function ConfirmBottomDrawerOrDialog({
  isOpen,
  title,
  description,
  content,
  cancelLabel,
  onCancel,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
  footerTopBorder = false,
  onDismiss = onCancel,
}: ConfirmBottomDrawerOrDialogProps): ReactNode {
  const isUpToExtraSmall = useMediaQuery(Media.upToExtraSmall(false))

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss()
      }
    },
    [onDismiss],
  )

  return (
    <BottomDrawerOrDialog isDrawer={isUpToExtraSmall} isOpen={isOpen} onOpenChange={handleOpenChange} variant="narrow">
      <Modal.Root>
        <ModalHeader title={title} titleAs={isUpToExtraSmall ? BottomDrawer.Title : Dialog.Title} onClose={onDismiss} />

        {description ? <Modal.Description>{description}</Modal.Description> : null}

        <Modal.Content>{content}</Modal.Content>

        <Modal.FooterWithTwoButtons
          topBorder={footerTopBorder}
          secondaryButton={{ label: cancelLabel, onClick: onCancel }}
          primaryButton={{ disabled: confirmDisabled, label: confirmLabel, onClick: onConfirm }}
        />
      </Modal.Root>
    </BottomDrawerOrDialog>
  )
}
