import { useCallback, useState } from 'react'
import { useConnect } from './useConnect'
import { useDisconnect, useWalletClient } from 'wagmi'
import { handleRpcError } from '@/util/handleRpcError'
import { useAddRpcWithTimeout } from './useAddRpcWithTimeout'
import { AddToWalletState, AddToWalletStateValues } from '@/components/AddRpcButton'

const DEFAULT_STATE: AddToWalletState = { state: 'unknown', autoConnect: false }
const ADDING_STATE: AddToWalletState = { state: 'adding', autoConnect: false }
const ADDED_STATE: AddToWalletState = { state: 'added', autoConnect: false }

export interface UseConnectAndAddToWalletProps {
  addWalletState: AddToWalletState
  connectAndAddToWallet: (() => Promise<void>) | null
  disconnectWallet: (() => void) | null
}

export function useConnectAndAddToWallet(): UseConnectAndAddToWalletProps {
  const { isConnected, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const [addWalletState, setState] = useState<AddToWalletState>(DEFAULT_STATE)
  const [addingPromise, setAddRpcPromise] = useState<Promise<boolean> | null>(null)

  const handleError = useCallback(
    (error: unknown) => {
      console.error(`[connectAndAddToWallet] handleError`, error)
      const { errorMessage: message, isError, isUserRejection } = handleRpcError(error)
      if (isUserRejection) {
        setState({ state: 'unknown', errorMessage: 'User rejected the request', autoConnect: false })
      } else if (isError) {
        setState({ state: 'error', errorMessage: message || undefined, autoConnect: false })
      } else {
        setState(DEFAULT_STATE)
      }
      setAddRpcPromise(null)
    },
    [setState],
  )

  const addToWallet = useAddRpcWithTimeout({
    isAdding: addWalletState.state === 'adding',
    addingPromise,
    onAdding(newAddRpcPromise) {
      console.debug('[connectAndAddToWallet] Adding RPC...')
      setAddRpcPromise(newAddRpcPromise)
      setState(ADDING_STATE)
    },
    onAdded() {
      console.debug('[connectAndAddToWallet] 🎉 RPC has been added!')
      setState(ADDED_STATE)
      setAddRpcPromise(null)
    },
    onTimeout(errorMessage: string, newState: AddToWalletStateValues) {
      console.debug(`[connectAndAddToWallet] New State: ${newState}. Message`, errorMessage)
      setState({
        state: newState,
        errorMessage: errorMessage || undefined,
        autoConnect: addWalletState.autoConnect,
      })
    },
    walletClient: walletClient ?? undefined,
    handleError,
  })

  const connectAndAddToWallet = useCallback((): Promise<void> => {
    if (!walletClient && isConnected) {
      return Promise.reject(new Error('Connection not allowed'))
    }

    return new Promise<void>((resolve, reject) => {
      if (!isConnected) {
        console.debug('[useConnectAndAddToWallet] Connecting...')
        connect()
          .then((result) => {
            if (result) {
              console.debug('[useConnectAndAddToWallet] 🔌 Connected!')
              addToWallet()
              resolve()
            } else {
              console.debug('[useConnectAndAddToWallet] Connection process incomplete')
              setState(DEFAULT_STATE)
              resolve()
            }
          })
          .catch((error: unknown) => {
            handleError(error)
            reject(error)
          })
      } else {
        console.debug('[useConnectAndAddToWallet] Already connected. Adding RPC endpoint...')
        addToWallet()
        resolve()
      }
    })
  }, [isConnected, connect, addToWallet, handleError, walletClient])

  const disconnectWallet = useCallback(() => {
    disconnect()
    setState(DEFAULT_STATE)
  }, [disconnect])

  return {
    connectAndAddToWallet: walletClient || !isConnected ? connectAndAddToWallet : null,
    disconnectWallet: isConnected ? disconnectWallet : null,
    addWalletState,
  }
}
