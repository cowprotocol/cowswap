import { useEffect } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Dispatch } from 'redux'

import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

/**
 * Updater to watch the mempoll and detect when a tx has been cancelled/replaced
 *
 * Currently disabled as previous provider (BlockNative) is no longer available
 *
 * TODO: find a new provider https://github.com/cowprotocol/cowswap/issues/4901
 */
export function CancelReplaceTxUpdater(): null {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const { chainId, account } = useWalletInfo()
  const dispatch = useAppDispatch()
  const accountLowerCase = account ? getAddressKey(account) : ''
  const pendingHashes = useAllTransactionHashes(
    (tx) =>
      !!tx.hash &&
      !tx.receipt &&
      !tx.replacementType &&
      !tx.linkedTransactionHash &&
      tx.hashType === HashType.ETHEREUM_TX &&
      getAddressKey(tx.from) === accountLowerCase,
  )

  useEffect(() => {
    // Watch the mempool for cancellation/replacement of tx (currently no-op)
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, pendingHashes, dispatch])

  return null
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
