import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { Media } from '../../consts'
import { BottomDrawer } from '../BottomDrawer/BottomDrawer.pure'
import { BottomDrawerOrDialog } from '../BottomDrawer/BottomDrawerOrDialog'
import { Dialog } from '../Dialog/Dialog.pure'
import { Modal } from '../Modal/Modal.pure'
import { ModalHeader } from '../ModalHeader'

import type { ModalFooterButtonVariant } from '../Modal/Footer/ModalFooterWithTwoButtons.pure'

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
  confirmVariant?: ModalFooterButtonVariant
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
  confirmVariant = 'default',
  onDismiss = onCancel,
}: ConfirmBottomDrawerOrDialogProps): ReactNode {
  const isUpToExtraSmall = useMediaQuery(Media.upToExtraSmall(false))

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isOpen) {
        onDismiss()
      }
    },
    [isOpen, onDismiss],
  )

  return (
    <BottomDrawerOrDialog isDrawer={isUpToExtraSmall} isOpen={isOpen} onOpenChange={handleOpenChange} variant="narrow">
      <Modal.Root>
        <ModalHeader title={title} titleAs={isUpToExtraSmall ? BottomDrawer.Title : Dialog.Title} onClose={onDismiss} />

        {description ? <Modal.Description>{description}</Modal.Description> : null}

        <Modal.Content>{content}</Modal.Content>

        <Modal.FooterWithTwoButtons
          secondaryButton={{ label: cancelLabel, onClick: onCancel }}
          primaryButton={{
            disabled: confirmDisabled,
            label: confirmLabel,
            onClick: onConfirm,
            variant: confirmVariant,
          }}
        />
      </Modal.Root>
    </BottomDrawerOrDialog>
  )
}
