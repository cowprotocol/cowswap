import { useMemo, useState } from 'react'

import useTransactionErrorModal from './useTransactionErrorModal'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useErrorModal() {
  const [internalError, setInternalError] = useState<string | undefined>()
  const { openModal, closeModal, TransactionErrorModal } = useTransactionErrorModal()

  return useMemo(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleCloseError = () => {
      closeModal()
      setInternalError(undefined)
    }
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleSetError = (error: string | undefined) => {
      setInternalError(error)

      // IF error, open modal
      error && openModal()
    }

    return {
      error: internalError,
      handleCloseError,
      handleSetError,
      ErrorModal: function ErrorModal({ message = internalError }: { message?: string }) {
        return <TransactionErrorModal onDismiss={handleCloseError} message={message} />
      },
    }
  }, [internalError, closeModal, openModal, TransactionErrorModal])
}
