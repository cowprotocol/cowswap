import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { Dispatch } from 'redux'

import { replaceTransaction } from 'legacy/state/enhancedTransactions/actions'
import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

import { sdk } from 'api/blocknative'

function watchTxChanges(pendingHashes: string[], chainId: number, dispatch: Dispatch) {
  for (const hash of pendingHashes) {
    try {
      const blocknativeSdk = sdk[chainId]

      if (!blocknativeSdk) {
        console.error('[CancelReplaceTxUpdater][watchTxChanges] No blocknative sdk for chainId', chainId)
        return
      }

      const { emitter } = blocknativeSdk.transaction(hash)
      console.info('[CancelReplaceTxUpdater][watchTxChanges]', { chainId, hash })
      const currentHash = hash

      emitter.on('txSpeedUp', (e) => {
        console.info('[CancelReplaceTxUpdater][watchTxChanges][txSpeedUp event]', { ...e })
        if ('replaceHash' in e && typeof e.replaceHash === 'string') {
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.replaceHash, type: 'speedup' }))
        }
      })

      emitter.on('txCancel', (e) => {
        console.info('[CancelReplaceTxUpdater][watchTxChanges][txCancel event]', { ...e })
        if ('replaceHash' in e && typeof e.replaceHash === 'string') {
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.replaceHash, type: 'cancel' }))
        }
      })
    } catch (error: any) {
      console.error('[CancelReplaceTxUpdater][watchTxChanges] Failed to watch tx', { hash }, error)
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
    } catch (error: any) {
      console.error('[CancelReplaceTxUpdater][unwatchTxChanges] Failed to unsubscribe', { hash })
    }
  }
}

export function CancelReplaceTxUpdater(): null {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const dispatch = useAppDispatch()
  const accountLowerCase = account?.toLowerCase() || ''
  const pendingHashes = useAllTransactionHashes(
    (tx) =>
      !!tx.hash && !tx.receipt && !tx.replacementType && !tx.linkedTransactionHash && tx.hashType === HashType.ETHEREUM_TX && tx.from.toLowerCase() === accountLowerCase
  )

  useEffect(() => {
    if (!chainId || !provider) return
    // Watch the mempool for cancellation/replacement of tx
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      // Unwatch the mempool
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, provider, pendingHashes, dispatch])

  return null
}
