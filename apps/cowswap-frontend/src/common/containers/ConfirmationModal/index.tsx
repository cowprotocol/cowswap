import { useAtomValue } from 'jotai'

import { confirmationModalContextAtom } from 'common/hooks/useConfirmationRequest'
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
      title={title}
      callToAction={callToAction}
      description={description}
      onEnable={onEnable}
      warning={warning}
      confirmWord={confirmWord}
      action={action}
      skipInput={skipInput}
    />
  )
}
