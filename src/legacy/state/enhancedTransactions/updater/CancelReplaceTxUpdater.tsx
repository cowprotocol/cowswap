import { useEffect } from 'react'

import { useWeb3React } from '@web3-react/core'

import { Dispatch } from 'redux'

import { replaceTransaction } from 'legacy/state/enhancedTransactions/actions'
import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'
import { useAppDispatch } from 'legacy/state/hooks'
import { sdk } from 'legacy/utils/blocknative'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

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

export default function CancelReplaceTxUpdater(): null {
  const { provider } = useWeb3React()
  const { chainId: _chainId, account } = useWalletInfo()
  const chainId = supportedChainId(_chainId)
  const dispatch = useAppDispatch()
  const accountLowerCase = account?.toLowerCase() || ''
  const pendingHashes = useAllTransactionHashes((tx) => !tx.receipt && tx.from.toLowerCase() === accountLowerCase)

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
