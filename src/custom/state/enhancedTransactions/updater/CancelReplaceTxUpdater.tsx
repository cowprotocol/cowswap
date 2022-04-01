import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { sdk } from 'utils/blocknative'
import { replaceTransaction } from 'state/enhancedTransactions/actions'
import { useAllTransactionHashes } from 'state/enhancedTransactions/hooks'
import { Dispatch } from 'redux'

function watchTxChanges(pendingHashes: string[], chainId: number, dispatch: Dispatch) {
  for (const hash of pendingHashes) {
    try {
      const blocknativeSdk = sdk[chainId]

      if (!blocknativeSdk) {
        return
      }

      const { emitter } = blocknativeSdk.transaction(hash)
      const currentHash = hash

      emitter.on('txSpeedUp', (e) => {
        if ('hash' in e && typeof e.hash === 'string') {
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash, type: 'speedup' }))
        }
      })

      emitter.on('txCancel', (e) => {
        if ('hash' in e && typeof e.hash === 'string') {
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash, type: 'cancel' }))
        }
      })
    } catch (error) {
      console.error('Failed to watch', hash, error)
    }
  }
}

function unwatchTxChanges(pendingHashes: string[], chainId: number) {
  const blocknativeSdk = sdk[chainId]

  if (!blocknativeSdk) {
    return
  }

  for (const hash of pendingHashes) {
    try {
      blocknativeSdk.unsubscribe(hash)
    } catch (error) {
      console.error('Failed to unsubscribe', hash)
    }
  }
}

export default function CancelReplaceTxUpdater(): null {
  const { chainId, library, account } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const accountLowerCase = account?.toLowerCase() || ''
  const pendingHashes = useAllTransactionHashes((tx) => !tx.receipt && tx.from.toLowerCase() === accountLowerCase)

  useEffect(() => {
    if (!chainId || !library) return

    // Watch the mempool for cancellation/replacement of tx
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      // Unwatch the mempool
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, library, pendingHashes, dispatch])

  return null
}
