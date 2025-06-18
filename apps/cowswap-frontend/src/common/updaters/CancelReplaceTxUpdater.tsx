import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Dispatch } from 'redux'

import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function watchTxChanges(_pendingHashes: string[], _chainId: number, _dispatch: Dispatch) {
  return
  // for (const hash of pendingHashes) {
  // try {
  //   const blocknativeSdk = null
  //
  //   if (!blocknativeSdk) {
  //     console.error('[CancelReplaceTxUpdater][watchTxChanges] No blocknative sdk for chainId', chainId)
  //     return
  //   }
  //
  //   const { emitter } = blocknativeSdk.transaction(hash)
  //   console.info('[CancelReplaceTxUpdater][watchTxChanges]', { chainId, hash })
  //   const currentHash = hash
  //
  //   emitter.on('txSpeedUp', (e) => {
  //     console.info('[CancelReplaceTxUpdater][watchTxChanges][txSpeedUp event]', { ...e })
  //     if ('replaceHash' in e && typeof e.replaceHash === 'string') {
  //       dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.replaceHash, type: 'speedup' }))
  //     }
  //   })
  //
  //   emitter.on('txCancel', (e) => {
  //     console.info('[CancelReplaceTxUpdater][watchTxChanges][txCancel event]', { ...e })
  //     if ('replaceHash' in e && typeof e.replaceHash === 'string') {
  //       dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.replaceHash, type: 'cancel' }))
  //     }
  //   })
  // } catch (error: any) {
  //   console.error('[CancelReplaceTxUpdater][watchTxChanges] Failed to watch tx', { hash }, error)
  // }
  // }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function unwatchTxChanges(_pendingHashes: string[], _chainId: number) {
  return
  // const blocknativeSdk = null
  //
  // if (!blocknativeSdk) {
  //   return
  // }
  //
  // for (const hash of pendingHashes) {
  //   try {
  //     blocknativeSdk.unsubscribe(hash)
  //   } catch {
  //     console.error('[CancelReplaceTxUpdater][unwatchTxChanges] Failed to unsubscribe', { hash })
  //   }
  // }
}

/**
 * Updater to watch the mempoll and detect when a tx has been cancelled/replaced
 *
 * Currently disabled as previous provider (BlockNative) is no longer available
 *
 * TODO: find a new provider https://github.com/cowprotocol/cowswap/issues/4901
 */
export function CancelReplaceTxUpdater(): null {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const dispatch = useAppDispatch()
  const accountLowerCase = account?.toLowerCase() || ''
  const pendingHashes = useAllTransactionHashes(
    (tx) =>
      !!tx.hash &&
      !tx.receipt &&
      !tx.replacementType &&
      !tx.linkedTransactionHash &&
      tx.hashType === HashType.ETHEREUM_TX &&
      tx.from.toLowerCase() === accountLowerCase,
  )

  useEffect(() => {
    if (!provider) return
    // Watch the mempool for cancellation/replacement of tx
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      // Unwatch the mempool
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, provider, pendingHashes, dispatch])

  return null
}
