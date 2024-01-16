import { useMemo, useState } from 'react'

import useTransactionErrorModal from './useTransactionErrorModal'

export function useErrorModal() {
  const [internalError, setInternalError] = useState<string | undefined>()
  const { openModal, closeModal, TransactionErrorModal } = useTransactionErrorModal()

  return useMemo(() => {
    const handleCloseError = () => {
      closeModal()
      setInternalError(undefined)
    }
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
