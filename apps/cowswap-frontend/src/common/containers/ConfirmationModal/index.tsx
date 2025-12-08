import { useAtomValue } from 'jotai'

import { t } from '@lingui/core/macro'

import { confirmationModalContextAtom, DEFAULT_CONFIRMATION_MODAL_CONTEXT } from 'common/hooks/useConfirmationRequest'
import { ConfirmationModal as Pure, ConfirmationModalProps } from 'common/pure/ConfirmationModal'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmationModal({ isOpen, onDismiss }: Pick<ConfirmationModalProps, 'isOpen' | 'onDismiss'>) {
  const { title, callToAction, description, onEnable, warning, confirmWord, action, skipInput } =
    useAtomValue(confirmationModalContextAtom)

  return (
    <Pure
      isOpen={isOpen}
      onDismiss={onDismiss}
      title={title === DEFAULT_CONFIRMATION_MODAL_CONTEXT.title ? t`Confirm Action` : title}
      callToAction={callToAction === DEFAULT_CONFIRMATION_MODAL_CONTEXT.callToAction ? t`Confirm` : callToAction}
      description={description}
      onEnable={onEnable}
      warning={warning}
      confirmWord={confirmWord === DEFAULT_CONFIRMATION_MODAL_CONTEXT.confirmWord ? t`confirm` : confirmWord}
      action={action}
      skipInput={skipInput}
    />
  )
}
