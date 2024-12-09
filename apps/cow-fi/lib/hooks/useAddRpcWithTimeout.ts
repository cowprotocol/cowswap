import { useCallback } from 'react'
import { ERROR_ADD_MANUALLY_MESSAGE } from '@/util/handleRpcError'
import { useAddRpcEndpoint } from './useAddRpcEndpoint'
import { WalletClient } from 'viem'

import { AddToWalletStateValues } from '../../types/addToWalletState'

const TAKING_TOO_LONG_TIME = 15000 // 15s
const TIMEOUT_TIME = 90000 // 1.5min

interface UseAddToWalletProps {
  isAdding: boolean
  onAdding: (promise: Promise<boolean>) => void
  onAdded: () => void
  walletClient: WalletClient | undefined
  addingPromise: Promise<boolean> | null
  handleError: (error: any) => void
  onTimeout: (
    errorMessage: string,
    newState: AddToWalletStateValues,
    // event: AddRpcUrlActionType
  ) => void
}

export function useAddRpcWithTimeout(props: UseAddToWalletProps) {
  const { isAdding, walletClient, addingPromise: addRpcPromise, onAdding, onAdded, handleError, onTimeout } = props
  const { addRpcEndpoint } = useAddRpcEndpoint(walletClient ?? undefined)

  return useCallback(() => {
    if (isAdding || !walletClient) {
      // No action if we are already adding or we are not yet connected
      return undefined
    }

    // Show a message if it takes long to connect/add-network
    const delayMessage = (
      errorMessage: string,
      newState: AddToWalletStateValues,
      delay: number,
      //   event: AddRpcUrlActionType
    ) =>
      setTimeout(() => {
        onTimeout(
          errorMessage,
          newState,
          // event
        )
      }, delay)

    // Gives some feedback if it takes long, plus add some timeout (some wallets don't have great support to add RPC endpoints)
    const timeoutSlow = delayMessage(
      'Adding the new network to your wallet is taking too long. Please verify your wallet',
      'adding',
      TAKING_TOO_LONG_TIME,
      //   'adding_is_taking_too_long'
    )
    const timeoutTimeout = delayMessage(
      ERROR_ADD_MANUALLY_MESSAGE.errorMessage,
      'error',
      TIMEOUT_TIME,
      //   'timeout_add_rpc'
    )
    const clearTimeouts = () => [timeoutSlow, timeoutTimeout].forEach(clearTimeout)

    const newAddRpcPromise = addRpcPromise ? addRpcPromise : addRpcEndpoint()
    onAdding(newAddRpcPromise)
    newAddRpcPromise
      .then((success) => {
        if (success) {
          onAdded()
        }
      })
      .catch(handleError)
      .finally(clearTimeouts)

    return clearTimeouts
  }, [addRpcEndpoint, isAdding, onAdding, onAdded, onTimeout, handleError, addRpcPromise, walletClient])
}
