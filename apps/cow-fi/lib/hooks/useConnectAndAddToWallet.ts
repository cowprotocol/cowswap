import { useCallback, useEffect, useState } from 'react'
import { useConnect } from './useConnect'
import { useDisconnect } from 'wagmi'
import { useWalletClient } from 'wagmi'
import { handleRpcError } from '@/util/handleRpcError'
import { useAddRpcWithTimeout } from './useAddRpcWithTimeout'
import { AddToWalletState, AddToWalletStateValues } from '@/components/AddRpcButton'

const DEFAULT_STATE: AddToWalletState = { state: 'unknown', autoConnect: false }
const ADDING_STATE: AddToWalletState = { state: 'adding', autoConnect: false }
const ADDED_STATE: AddToWalletState = { state: 'added', autoConnect: false }

export interface UseConnectAndAddToWalletPros {
  addWalletState: AddToWalletState
  connectAndAddToWallet: (() => Promise<void>) | null
  disconnectWallet: (() => void) | null
}

export function useConnectAndAddToWallet(): UseConnectAndAddToWalletPros {
  const { isConnected, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const { data: walletClient } = useWalletClient()
  const [addWalletState, setState] = useState<AddToWalletState>(DEFAULT_STATE)
  const [addingPromise, setAddRpcPromise] = useState<Promise<boolean> | null>(null)
  const { state, autoConnect } = addWalletState

  // Handle RPC errors
  const handleError = useCallback(
    (error: unknown) => {
      console.error(`[connectAndAddToWallet] handleError`, error)

      const { errorMessage: message, isError, isUserRejection } = handleRpcError(error)

      if (isError || isUserRejection) {
        // Display the error
        setState({ state: 'error', errorMessage: message || undefined, autoConnect: false })
      } else {
        // Not an error: i.e The user is connecting
        setState(DEFAULT_STATE)
      }
      setAddRpcPromise(null)
    },
    [setState]
  )

  // Add RPC endpoint to wallet (with analytics + handle timeout state)
  const addToWallet = useAddRpcWithTimeout({
    isAdding: state === 'adding',
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
        autoConnect,
      })
    },
    walletClient: walletClient ?? undefined,
    handleError,
  })

  // Connect and auto-add the RPC endpoint
  const allowToConnectAndAddToWallet = !isConnected || walletClient // allow to connectAndAddToWallet if not connected, or if the client is ready
  const connectAndAddToWallet = useCallback((): Promise<void> => {
    if (!allowToConnectAndAddToWallet) {
      return Promise.reject(new Error('Connection not allowed'))
    }

    return new Promise<void>((resolve, reject) => {
      if (!isConnected) {
        console.debug('[useConnectAndAddToWallet] Connecting...')
        connect()
          .then(() => {
            console.debug('[useConnectAndAddToWallet] 🔌 Connected!')
            addToWallet()
            resolve()
          })
          .catch((error) => {
            handleError(error)
            reject(error)
          })
      } else {
        console.debug('[useConnectAndAddToWallet] Already connected. Adding RPC endpoint...')
        addToWallet()
        resolve()
      }
    })
  }, [allowToConnectAndAddToWallet, isConnected, handleError, connect, addToWallet])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  // Auto-connect (once we have )
  useEffect(() => {
    if (isConnected && walletClient && autoConnect) {
      addToWallet()
    }
  }, [isConnected, walletClient, autoConnect, addToWallet])

  return {
    connectAndAddToWallet: allowToConnectAndAddToWallet ? connectAndAddToWallet : null,
    disconnectWallet: isConnected ? disconnectWallet : null,
    addWalletState,
  }
}
