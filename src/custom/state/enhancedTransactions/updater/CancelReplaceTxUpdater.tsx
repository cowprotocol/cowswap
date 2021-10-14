import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { sdk } from 'utils/blocknative'
import { cancelTransaction, replaceTransaction } from 'state/enhancedTransactions/actions'
import { useAllTransactionHashes } from 'state/enhancedTransactions/hooks'
import { Dispatch } from 'redux'

function watchTxChanges(pendingHashes: string[], chainId: number, dispatch: Dispatch) {
  for (const hash of pendingHashes) {
    try {
      const blocknativeSdk = sdk[chainId]

      if (!blocknativeSdk) {
        console.warn(`TransactionUpdater::BlocknativeSdk not available`)
        return
      }

      const { emitter } = blocknativeSdk.transaction(hash)
      const currentHash = hash
      let isSpeedup = false

      emitter.on('txSpeedUp', (e) => {
        isSpeedup = true
        if ('hash' in e && typeof e.hash === 'string') {
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash }))
        }
      })

      emitter.on('txConfirmed', (e) => {
        // canceled txs are automatically watched by bnc so if the confirmed tx hash is different than the previously tracked one, it means the user sent a cancel tx
        if ('hash' in e && e.hash !== currentHash && !isSpeedup) {
          dispatch(cancelTransaction({ chainId, hash: currentHash }))
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
    console.warn(`TransactionUpdater::BlocknativeSdk not available`)
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
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const pendingHashes = useAllTransactionHashes((tx) => !tx.receipt)

  useEffect(() => {
    if (!chainId || !library) return

    // Watch the mempool for cancelation/replacement of tx
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      // Unwatch the mempool
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, library, pendingHashes, dispatch])

  return null
}
