import { useMemo, useState } from 'react'

import { ErrorMessageProps, SwapCallbackError } from 'legacy/components/swap/styleds'

import useTransactionErrorModal from './useTransactionErrorModal'

/**
 * @description hook for getting CoW Swap error and handling them visually
 * @description ErrorMessage component accepts an error message to override exported error state, and a close option
 * @returns returns object: { error, setError, ErrorMessage } => error message, error message setter, and our ErrorMessage component
 */
export function useErrorMessage() {
  const [internalError, setError] = useState<string | undefined>()

  return useMemo(() => {
    const handleCloseError = () => setError(undefined)

    return {
      error: internalError,
      handleSetError: setError,
      ErrorMessage: function ErrorMessage({
        error = internalError,
        showClose = false,
        ...rest
      }: Pick<ErrorMessageProps, 'error' | 'showClose' | '$css'>) {
        return error ? (
          <SwapCallbackError showClose={showClose} handleClose={handleCloseError} error={error} {...rest} />
        ) : null
      },
    }
  }, [internalError])
}

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
