import { useCallback, useState } from 'react'
import { useConnect } from './useConnect'
import { useDisconnect, useWalletClient } from 'wagmi'
import { handleRpcError } from '@/util/handleRpcError'
import { useAddRpcWithTimeout } from './useAddRpcWithTimeout'
import { AddToWalletState, AddToWalletStateValues } from '../../types/addToWalletState'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'

const DEFAULT_STATE: AddToWalletState = { state: 'unknown', autoConnect: false }
const ADDING_STATE: AddToWalletState = { state: 'adding', autoConnect: false }
const ADDED_STATE: AddToWalletState = { state: 'added', autoConnect: false }

export interface UseConnectAndAddToWalletProps {
  addWalletState: AddToWalletState
  connectAndAddToWallet: (() => Promise<void>) | null
  disconnectWallet: (() => void) | null
}

export function useConnectAndAddToWallet(): UseConnectAndAddToWalletProps {
  const { connect, isConnected = false } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const cowAnalytics = useCowAnalytics()
  const [addWalletState, setState] = useState<AddToWalletState>(DEFAULT_STATE)
  const [addingPromise, setAddRpcPromise] = useState<Promise<boolean> | null>(null)

  const handleError = useCallback(
    (error: unknown) => {
      console.error(`[connectAndAddToWallet] handleError`, error)
      const { errorMessage: message, isError, isUserRejection } = handleRpcError(error)
      if (isUserRejection) {
        cowAnalytics.sendEvent({
          category: CowFiCategory.MEVBLOCKER,
          action: 'Add RPC Error',
          label: 'User Rejected',
        })
        setState({ state: 'unknown', errorMessage: 'User rejected the request', autoConnect: false })
      } else if (isError) {
        cowAnalytics.sendEvent({
          category: CowFiCategory.MEVBLOCKER,
          action: 'Add RPC Error',
          label: error instanceof Error ? error.message : 'Unknown error',
        })
        setState({ state: 'error', errorMessage: message || undefined, autoConnect: false })
      } else {
        setState(DEFAULT_STATE)
      }
      setAddRpcPromise(null)
    },
    [setState, cowAnalytics],
  )

  const addToWallet = useAddRpcWithTimeout({
    isAdding: addWalletState.state === 'adding',
    addingPromise,
    onAdding(newAddRpcPromise) {
      console.debug('[connectAndAddToWallet] Adding RPC...')
      cowAnalytics.sendEvent({
        category: CowFiCategory.MEVBLOCKER,
        action: 'Add RPC',
        label: 'Adding',
      })
      setAddRpcPromise(newAddRpcPromise)
      setState(ADDING_STATE)
    },
    onAdded() {
      console.debug('[connectAndAddToWallet] 🎉 RPC has been added!')
      cowAnalytics.sendEvent({
        category: CowFiCategory.MEVBLOCKER,
        action: 'Add RPC',
        label: 'Success',
      })
      setState(ADDED_STATE)
      setAddRpcPromise(null)
    },
    onTimeout(errorMessage: string, newState: AddToWalletStateValues) {
      console.debug(`[connectAndAddToWallet] New State: ${newState}. Message`, errorMessage)
      cowAnalytics.sendEvent({
        category: CowFiCategory.MEVBLOCKER,
        action: 'Add RPC Error',
        label: 'Timeout',
        value: errorMessage ? 1 : 0,
      })
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
        cowAnalytics.sendEvent({
          category: CowFiCategory.MEVBLOCKER,
          action: 'Attempt Connect Wallet',
        })
        connect()
          .then((result) => {
            if (result) {
              console.debug('[useConnectAndAddToWallet] 🔌 Connected!')
              cowAnalytics.sendEvent({
                category: CowFiCategory.MEVBLOCKER,
                action: 'Wallet Connected',
              })
              cowAnalytics.sendEvent({
                category: CowFiCategory.MEVBLOCKER,
                action: 'Attempt Add RPC',
              })
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
        cowAnalytics.sendEvent({
          category: CowFiCategory.MEVBLOCKER,
          action: 'Attempt Add RPC',
        })
        addToWallet()
        resolve()
      }
    })
  }, [isConnected, connect, addToWallet, handleError, walletClient, cowAnalytics])

  const disconnectWallet = useCallback(() => {
    cowAnalytics.sendEvent({
      category: CowFiCategory.MEVBLOCKER,
      action: 'Wallet Disconnected',
    })
    disconnect()
    setState(DEFAULT_STATE)
  }, [disconnect, cowAnalytics])

  return {
    connectAndAddToWallet: walletClient || !isConnected ? connectAndAddToWallet : null,
    disconnectWallet: isConnected ? disconnectWallet : null,
    addWalletState,
  }
}
